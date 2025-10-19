# セキュリティ機能実装ガイド

本ドキュメントは、Paintlyに実装されたセキュリティ機能と、追加実装が推奨される機能の詳細ガイドです。

---

## ✅ 実装済みセキュリティ機能

### 1. 2要素認証（MFA/TOTP）
**実装状況**: ✅ **完全実装済み**
**実装日**: 2025年10月19日

#### 実装ファイル
- `components/mfa-setup.tsx` - MFA設定UI
- `components/mfa-verify.tsx` - MFA検証UI
- `app/settings/page.tsx` - 設定ページに統合

#### 機能
- ✅ TOTP（Time-based One-Time Password）認証
- ✅ QRコード生成（Authenticatorアプリ用）
- ✅ シークレットキー手動入力サポート
- ✅ 複数デバイス登録（最大10台）
- ✅ バックアップデバイス推奨
- ✅ デバイス管理（無効化機能）

#### 推奨Authenticatorアプリ
- Google Authenticator
- Microsoft Authenticator
- 1Password
- Authy

#### 使用方法
1. `/settings`ページにアクセス
2. 「2要素認証（MFA）」セクションで「2要素認証を有効にする」をクリック
3. 表示されたQRコードをAuthenticatorアプリでスキャン
4. アプリに表示された6桁のコードを入力して確認

### 2. Stripe本番環境切り替え
**実装状況**: ✅ **完全実装済み**
**実装日**: 2025年10月19日

#### 変更内容
```.env.local
# 旧（テストモード）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# 新（本番モード）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXX... (Vercel環境変数で管理)
STRIPE_SECRET_KEY=sk_live_XXXXX... (Vercel環境変数で管理)
```

#### 注意事項
⚠️ **本番環境のPrice IDsはStripeダッシュボードで手動作成が必要**

手順：
1. Stripeダッシュボード → Products → Create product
2. 以下の5つのプランを作成：
   - 無料プラン: ¥0/month
   - ライトプラン: ¥2,980/month
   - スタンダードプラン: ¥5,980/month
   - プロプラン: ¥9,980/month
   - ビジネスプラン: ¥19,800/month
3. 各プランのPrice IDを`.env.local`に設定

---

## 🚧 追加実装推奨セキュリティ機能

### 3. アカウントロックアウト（10回失敗時）
**実装状況**: ⚠️ **部分実装（IPベースのみ）**
**優先度**: 🔴 **高**

#### 現状
- ✅ IPベースのレート制限（10回/60秒）
- ❌ アカウント単位のロックアウトなし

#### 実装ガイド

**ステップ1: Supabase RLSポリシー更新**
```sql
-- auth.usersテーブルに列追加（Supabase管理画面で実行）
-- ※ auth.usersテーブルは直接変更できないため、別テーブルで管理

CREATE TABLE IF NOT EXISTS public.user_security (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（サービスロールのみ更新可能）
CREATE POLICY "Service role can manage user security"
  ON public.user_security
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

**ステップ2: ログイン失敗処理を追加**

`app/auth/signin/page.tsx`
```typescript
const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    // 1. アカウントロック状態を確認
    const { data: securityData } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_email', email)  // emailで検索
      .single()

    if (securityData?.locked_until) {
      const lockUntil = new Date(securityData.locked_until)
      if (lockUntil > new Date()) {
        const minutes = Math.ceil((lockUntil.getTime() - Date.now()) / 60000)
        setError(\`アカウントがロックされています。\${minutes}分後に再試行してください。\`)
        setLoading(false)
        return
      }
    }

    // 2. ログイン試行
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // 3. ログイン失敗時：カウンター増加
      const { data: userData } = await supabase.auth.admin.listUsers()
      const user = userData?.users.find(u => u.email === email)

      if (user) {
        const newAttempts = (securityData?.failed_login_attempts || 0) + 1

        if (newAttempts >= 10) {
          // 10回失敗 → 30分ロック
          await supabase
            .from('user_security')
            .upsert({
              user_id: user.id,
              user_email: email,
              failed_login_attempts: newAttempts,
              locked_until: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            })
          setError('ログインに10回失敗しました。アカウントを30分間ロックします。')
        } else {
          // 失敗カウント更新
          await supabase
            .from('user_security')
            .upsert({
              user_id: user.id,
              user_email: email,
              failed_login_attempts: newAttempts
            })
          setError(\`ログイン失敗。残り試行回数: \${10 - newAttempts}回\`)
        }
      }

      setLoading(false)
      return
    }

    // 4. ログイン成功時：カウンターリセット
    if (data?.user) {
      await supabase
        .from('user_security')
        .upsert({
          user_id: data.user.id,
          user_email: email,
          failed_login_attempts: 0,
          locked_until: null
        })

      router.push('/dashboard')
      router.refresh()
    }
  } catch (error) {
    setError('サインインに失敗しました。')
    setLoading(false)
  }
}
```

**ステップ3: 管理画面でロック解除機能追加（オプション）**
```typescript
// app/admin/unlock-account/page.tsx
const unlockAccount = async (userId: string) => {
  await supabase
    .from('user_security')
    .update({
      failed_login_attempts: 0,
      locked_until: null
    })
    .eq('user_id', userId)
}
```

---

### 4. IP制限（管理画面アクセス制限）
**実装状況**: ❌ **未実装**
**優先度**: 🟡 **中**

#### 実装ガイド

**ステップ1: 環境変数追加**
```.env.local
# 管理画面アクセス許可IPアドレス（カンマ区切り）
ADMIN_ALLOWED_IPS=192.168.1.100,203.0.113.42,198.51.100.0/24

# 空の場合はIP制限なし（すべて許可）
# ADMIN_ALLOWED_IPS=
```

**ステップ2: middleware.ts更新**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// IP取得ヘルパー関数
function getClientIP(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return null
}

// CIDR範囲チェック（簡易版）
function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  if (allowedIPs.length === 0) {
    return true // 制限なし
  }

  for (const allowedIP of allowedIPs) {
    if (allowedIP.includes('/')) {
      // CIDR範囲（例: 192.168.1.0/24）
      // 完全な実装にはip-cidrライブラリ推奨
      continue
    }

    if (clientIP === allowedIP.trim()) {
      return true
    }
  }

  return false
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // IP制限チェック（管理画面パスのみ）
  const adminPaths = ['/settings', '/billing']
  const isAdminPath = adminPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isAdminPath && process.env.ADMIN_ALLOWED_IPS) {
    const clientIP = getClientIP(request)
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS.split(',')

    if (clientIP && !isIPAllowed(clientIP, allowedIPs)) {
      return NextResponse.json(
        { error: 'Access denied: IP address not allowed' },
        { status: 403 }
      )
    }
  }

  // 既存の認証チェック...
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { /* ... */ }
  )

  // ... 残りの既存コード
}
```

**ステップ3: Vercel環境変数設定**
1. Vercelダッシュボード → Settings → Environment Variables
2. `ADMIN_ALLOWED_IPS` を追加
3. Production環境に適用

---

### 5. CAPTCHA（Google reCAPTCHA v3）
**実装状況**: ❌ **未実装**
**優先度**: 🟡 **中**

#### 実装ガイド

**ステップ1: Google reCAPTCHA v3 登録**
1. https://www.google.com/recaptcha/admin にアクセス
2. 新しいサイトを登録
   - ラベル: Paintly
   - reCAPTCHA タイプ: reCAPTCHA v3
   - ドメイン: paintly.pro, localhost（開発用）
3. サイトキーとシークレットキーを取得

**ステップ2: 環境変数追加**
```.env.local
# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**ステップ3: ライブラリインストール**
```bash
npm install react-google-recaptcha-v3
```

**ステップ4: アプリケーションにreCAPTCHAを統合**

`app/layout.tsx`
```typescript
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          scriptProps={{
            async: true,
            defer: true,
            appendTo: 'head',
          }}
        >
          {children}
        </GoogleReCaptchaProvider>
      </body>
    </html>
  )
}
```

**ステップ5: サインアップページに統合**

`app/auth/signup/page.tsx`
```typescript
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

export default function SignUpPage() {
  const { executeRecaptcha } = useGoogleReCaptcha()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!executeRecaptcha) {
      setError('reCAPTCHAが読み込まれていません')
      return
    }

    // reCAPTCHAトークン取得
    const token = await executeRecaptcha('signup')

    // サーバーサイドで検証
    const response = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    const { success, score } = await response.json()

    if (!success || score < 0.5) {
      setError('bot検出: アカウント作成できません')
      return
    }

    // 通常のサインアップ処理
    const { error } = await supabase.auth.signUp({ email, password })
    // ...
  }
}
```

**ステップ6: サーバーサイド検証API**

`app/api/verify-recaptcha/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { token } = await request.json()

  const verifyURL = 'https://www.google.com/recaptcha/api/siteverify'
  const secretKey = process.env.RECAPTCHA_SECRET_KEY!

  const response = await fetch(verifyURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: \`secret=\${secretKey}&response=\${token}\`
  })

  const data = await response.json()

  return NextResponse.json({
    success: data.success,
    score: data.score,
    action: data.action
  })
}
```

---

## 🔍 脆弱性診断ガイドライン

### 6. 外部脆弱性診断（ペネトレーションテスト）
**実装状況**: ❌ **未実施**
**優先度**: 🔴 **高（年1回推奨）**

#### 推奨ツール

**無料ツール**
1. **OWASP ZAP**（Zed Attack Proxy）
   - URL: https://www.zaproxy.org/
   - 用途: 自動脆弱性スキャン
   - 実行方法:
     ```bash
     # Docker版
     docker run -t owasp/zap2docker-stable zap-baseline.py -t https://paintly.pro
     ```

2. **Nikto**
   - URL: https://cirt.net/Nikto2
   - 用途: Webサーバー脆弱性スキャン
   - 実行方法:
     ```bash
     nikto -h https://paintly.pro
     ```

3. **Nuclei**
   - URL: https://github.com/projectdiscovery/nuclei
   - 用途: 高速脆弱性スキャナー
   - 実行方法:
     ```bash
     nuclei -u https://paintly.pro
     ```

**有料サービス**
1. **Burp Suite Professional**（年間 ¥52,000〜）
   - 最も包括的なペネトレーションテストツール
   - URL: https://portswigger.net/burp

2. **Acunetix**（年間 ¥480,000〜）
   - 自動 + 手動ペネトレーションテスト
   - URL: https://www.acunetix.com/

3. **Qualys Web Application Scanning**（年間 ¥360,000〜）
   - エンタープライズ向け
   - URL: https://www.qualys.com/apps/web-app-scanning/

#### 実施スケジュール
- **本番公開前**: 必須
- **本番公開後**: 年1回（推奨: 毎年4月）
- **大規模アップデート後**: 推奨

#### 検証項目チェックリスト
- [ ] SQLインジェクション
- [ ] XSS（クロスサイトスクリプティング）
- [ ] CSRF（クロスサイトリクエストフォージェリ）
- [ ] 認証・認可の脆弱性
- [ ] セッション管理の問題
- [ ] ファイルアップロードの脆弱性
- [ ] HTTPSセキュリティヘッダー
- [ ] 機密情報の漏洩
- [ ] API脆弱性
- [ ] サードパーティライブラリの脆弱性

---

## 📊 セキュリティチェックリスト更新

上記の実装完了後、`STRIPE_SECURITY_CHECKLIST.md`を更新してください。

### 更新箇所
1. **質問3: 管理者画面のアクセス制限**
   - IPアドレス制限: ✅ 実装済み → 完全実装
   - 2要素認証: ✅ 実装済み → 完全実装
   - アカウントロック: ❌ 未実装 → ✅ 実装済み

2. **質問5: Webアプリケーション脆弱性対策**
   - 脆弱性診断: ⚠️ 部分実装 → ✅ 年1回実施

3. **質問8-1: 会員登録時のセキュリティ**
   - CAPTCHA: ❌ 未実装 → ✅ 実装済み

---

**作成者**: Claude (AI Assistant)
**作成日**: 2025年10月19日
**最終更新**: 2025年10月19日
