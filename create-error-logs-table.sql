-- エラーログテーブルの作成
-- Paintlyアプリケーションのクライアントサイドエラーを収集・分析するためのテーブル

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_id TEXT NOT NULL UNIQUE, -- クライアントサイドで生成されるユニークID
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  error_type TEXT NOT NULL CHECK (error_type IN ('javascript', 'promise', 'resource', 'api', 'auth', 'critical', 'network', 'performance')),
  message TEXT NOT NULL,
  user_agent TEXT,
  url TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- ユーザーがログインしている場合
  stack_trace TEXT,
  retry_count INTEGER DEFAULT 0,
  session_id TEXT,

  -- ビューポート情報
  viewport_width INTEGER,
  viewport_height INTEGER,

  -- パフォーマンス情報
  load_time INTEGER, -- ミリ秒
  dom_content_loaded INTEGER, -- ミリ秒
  memory_used BIGINT, -- バイト
  memory_total BIGINT, -- バイト
  memory_limit BIGINT, -- バイト

  -- 追加のコンテキスト情報
  component_name TEXT, -- エラーが発生したコンポーネント名
  action_type TEXT, -- エラーが発生したアクション（例：color_selection, image_upload）
  context JSONB, -- 追加のコンテキスト情報

  -- エラー解決状況
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成（クエリパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_url ON error_logs(url);
CREATE INDEX IF NOT EXISTS idx_error_logs_component_name ON error_logs(component_name);
CREATE INDEX IF NOT EXISTS idx_error_logs_is_resolved ON error_logs(is_resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);

-- 複合インデックス（よく使われるクエリパターン用）
CREATE INDEX IF NOT EXISTS idx_error_logs_type_timestamp ON error_logs(error_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_timestamp ON error_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved ON error_logs(is_resolved, timestamp) WHERE is_resolved = FALSE;

-- RLS (Row Level Security) の設定
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能（後で適切な管理者認証システムと統合）
CREATE POLICY "Admin can view all error logs" ON error_logs
  FOR SELECT USING (true); -- 一時的に全てのユーザーが閲覧可能（後で制限）

CREATE POLICY "System can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (true); -- システムからのエラーレポート投稿を許可

CREATE POLICY "Admin can update error logs" ON error_logs
  FOR UPDATE USING (true); -- 管理者がエラー解決状況を更新可能

-- updated_atの自動更新トリガー
CREATE TRIGGER update_error_logs_updated_at BEFORE UPDATE ON error_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- エラー統計用のマテリアライズドビュー（パフォーマンス向上）
CREATE MATERIALIZED VIEW IF NOT EXISTS error_stats_hourly AS
SELECT
  date_trunc('hour', timestamp) AS hour,
  error_type,
  COUNT(*) AS error_count,
  COUNT(DISTINCT user_id) AS affected_users,
  COUNT(DISTINCT session_id) AS affected_sessions
FROM error_logs
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY date_trunc('hour', timestamp), error_type
ORDER BY hour DESC, error_count DESC;

-- マテリアライズドビューのインデックス
CREATE INDEX IF NOT EXISTS idx_error_stats_hourly_hour ON error_stats_hourly(hour);
CREATE INDEX IF NOT EXISTS idx_error_stats_hourly_type ON error_stats_hourly(error_type);

-- エラー統計の日次更新用関数
CREATE OR REPLACE FUNCTION refresh_error_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW error_stats_hourly;
END;
$$ LANGUAGE plpgsql;

-- コメント追加
COMMENT ON TABLE error_logs IS 'クライアントサイドエラーレポートの収集テーブル';
COMMENT ON COLUMN error_logs.error_id IS 'クライアントサイドで生成されるユニークなエラーID';
COMMENT ON COLUMN error_logs.error_type IS 'エラーの種類（javascript, promise, resource, api, auth, critical, network, performance）';
COMMENT ON COLUMN error_logs.component_name IS 'エラーが発生したReactコンポーネント名';
COMMENT ON COLUMN error_logs.action_type IS 'エラーが発生したユーザーアクション';
COMMENT ON COLUMN error_logs.context IS '追加のコンテキスト情報（JSON形式）';
COMMENT ON COLUMN error_logs.is_resolved IS 'エラーが解決済みかどうか';
COMMENT ON MATERIALIZED VIEW error_stats_hourly IS '時間別エラー統計（7日間）';