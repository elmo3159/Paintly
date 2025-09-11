# 🚨 緊急: データベーステーブルを作成してください

## 問題の原因
データベーステーブルが存在しないため、エラーが発生しています。

## 今すぐ実行が必要な手順

### 📊 Supabase SQL Editorでテーブルを作成

1. **[Supabase SQL Editor](https://supabase.com/dashboard/project/mockfjcakfzbzccabcgm/sql/new)を開く**

2. **以下のSQLを貼り付けて実行**（RUNボタンをクリック）:

```sql
-- プランテーブル
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  generation_limit INTEGER NOT NULL,
  storage_months INTEGER NOT NULL,
  features JSONB,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- サブスクリプションテーブル
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  generation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 顧客ページテーブル
CREATE TABLE IF NOT EXISTS customer_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 生成画像テーブル
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  customer_page_id UUID REFERENCES customer_pages(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT,
  side_image_url TEXT,
  wall_color TEXT,
  roof_color TEXT,
  door_color TEXT,
  weather TEXT,
  other_instructions TEXT,
  prompt TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_customer_pages_user_id ON customer_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_customer_page_id ON generations(customer_page_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);

-- 初期プランデータの挿入
INSERT INTO plans (name, price, generation_limit, storage_months, features, stripe_price_id)
VALUES 
  ('無料プラン', 0, 3, 0, '{"customer_pages": 3, "image_storage_days": 7}', NULL),
  ('ライトプラン', 2980, 30, 1, '{"customer_pages": "unlimited", "image_storage_days": 30}', NULL),
  ('スタンダードプラン', 5980, 100, 3, '{"customer_pages": "unlimited", "image_storage_days": 90}', NULL),
  ('プロプラン', 9980, 300, 6, '{"customer_pages": "unlimited", "image_storage_days": 180}', NULL),
  ('ビジネスプラン', 19800, 1000, 12, '{"customer_pages": "unlimited", "image_storage_days": 365}', NULL)
ON CONFLICT (name) DO NOTHING;
```

3. **次に、RLS（Row Level Security）ポリシーを設定**:

```sql
-- RLS (Row Level Security) ポリシー
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのポリシー
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- サブスクリプションテーブルのポリシー
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 顧客ページテーブルのポリシー
CREATE POLICY "Users can view own customer pages" ON customer_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create customer pages" ON customer_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customer pages" ON customer_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customer pages" ON customer_pages
  FOR DELETE USING (auth.uid() = user_id);

-- 生成画像テーブルのポリシー
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations" ON generations
  FOR DELETE USING (auth.uid() = user_id);
```

4. **最後に、トリガーを設定**:

```sql
-- トリガー関数：updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_pages_updated_at BEFORE UPDATE ON customer_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generations_updated_at BEFORE UPDATE ON generations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## ✅ 実行確認

各SQLを実行後、以下を確認：

1. **Table Editor**タブで以下のテーブルが表示されること:
   - users
   - plans (5つのプランデータが入っているはず)
   - subscriptions
   - customer_pages
   - generations

2. **成功メッセージ**が表示されること

## 🔄 実行後の手順

1. テーブル作成完了後、ブラウザのキャッシュをクリア
2. `https://paintly-pearl.vercel.app/auth/signin`にアクセス
3. Googleログインを再度試す

## ⚠️ エラーが出た場合

もしSQLエラーが出た場合は、以下を確認：
- `auth.users`テーブルが存在することを確認（Authenticationタブで確認）
- 既存のテーブルがある場合は、一度削除してから再実行

## 📞 サポート

問題が続く場合は、Supabaseの実行結果のスクリーンショットを共有してください。