-- 追加ポリシー: Plansテーブルは全ユーザーが読み取り可能
-- (plansテーブルはRLSを無効化するか、全ユーザー読み取りポリシーを追加)

-- Option 1: RLSを無効化（推奨）
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;

-- Option 2: 全ユーザーが読み取り可能なポリシーを追加
-- ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Everyone can view plans" ON plans
--   FOR SELECT USING (true);