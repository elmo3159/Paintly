# Vercel URL構造の説明

## 現在の状況

Vercelには2種類のURLが存在しています：

### 1. 本番環境URL（Production）
```
https://paintly.vercel.app
```
- これが**正式なURL**です
- mainブランチの最新コードがデプロイされます
- ユーザーがアクセスすべきURL

### 2. プレビューデプロイURL
```
https://paintly-618kxqwot-elmos-projects-cf77d205.vercel.app
```
- これは**プレビュー環境**のURL
- 特定のコミットやブランチのデプロイメント
- 自動生成されるURL（ハッシュ付き）
- 開発中のテスト用

## なぜ2つの画面が違うのか？

プレビューURLは**古いバージョン**のコードを表示している可能性があります：
- 日本語化前のバージョン
- Googleログインボタン追加前のバージョン

## 解決方法

### Vercelダッシュボードで確認

1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. **paintly**プロジェクトをクリック
3. **Deployments**タブを確認
4. **Production**と表示されているデプロイメントが最新か確認

### 正しいアクセス方法

**常にこのURLを使用してください：**
```
https://paintly.vercel.app
```

**Vercelの「Visit」ボタンについて：**
- 「Visit」ボタンは現在表示しているデプロイメントのURLを開きます
- Production以外のデプロイメントを見ている場合、プレビューURLが開きます
- **Production**タグがついているデプロイメントの「Visit」ボタンを使用してください

## プレビューデプロイメントの無効化

不要な混乱を避けるため、プレビューデプロイメントを無効化できます：

1. Vercel → Settings → Git
2. **Preview Deployments**をOFFにする
3. これによりmainブランチ以外のデプロイメントが作成されなくなります

## 環境変数の確認

両方の環境で環境変数が正しく設定されているか確認：
- Production環境
- Preview環境（必要な場合）

通常はProduction環境のみに環境変数を設定すれば十分です。