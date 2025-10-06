const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUserProfilesTable() {
  console.log('🚀 user_profilesテーブルの作成を開始...')

  try {
    // テーブル作成
    const { data: createTableData, error: createTableError } = await supabase.rpc('exec', {
      sql: `
        -- user_profilesテーブルを作成
        CREATE TABLE IF NOT EXISTS public.user_profiles (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          sales_person_name text,
          company_name text,
          contact_info text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(user_id)
        );
      `
    })

    if (createTableError) {
      console.error('❌ テーブル作成エラー:', createTableError)
    } else {
      console.log('✅ user_profilesテーブル作成成功')
    }

    // RLS有効化
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;'
    })

    if (rlsError) {
      console.error('❌ RLS有効化エラー:', rlsError)
    } else {
      console.log('✅ RLS有効化成功')
    }

    // ポリシー作成
    const policies = [
      {
        name: 'Users can view own profile',
        sql: 'CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);'
      },
      {
        name: 'Users can insert own profile',
        sql: 'CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);'
      },
      {
        name: 'Users can update own profile',
        sql: 'CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);'
      }
    ]

    for (const policy of policies) {
      const { data: policyData, error: policyError } = await supabase.rpc('exec', {
        sql: policy.sql
      })

      if (policyError) {
        console.error(`❌ ポリシー作成エラー (${policy.name}):`, policyError)
      } else {
        console.log(`✅ ポリシー作成成功: ${policy.name}`)
      }
    }

    // インデックス作成
    const { data: indexData, error: indexError } = await supabase.rpc('exec', {
      sql: 'CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles(user_id);'
    })

    if (indexError) {
      console.error('❌ インデックス作成エラー:', indexError)
    } else {
      console.log('✅ インデックス作成成功')
    }

    // トリガー関数作成
    const { data: funcData, error: funcError } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    })

    if (funcError) {
      console.error('❌ トリガー関数作成エラー:', funcError)
    } else {
      console.log('✅ トリガー関数作成成功')
    }

    // トリガー作成
    const { data: triggerData, error: triggerError } = await supabase.rpc('exec', {
      sql: `
        CREATE TRIGGER handle_user_profiles_updated_at
          BEFORE UPDATE ON public.user_profiles
          FOR EACH ROW
          EXECUTE PROCEDURE public.handle_updated_at();
      `
    })

    if (triggerError) {
      console.error('❌ トリガー作成エラー:', triggerError)
    } else {
      console.log('✅ トリガー作成成功')
    }

    console.log('🎉 user_profilesテーブル初期化完了！')

  } catch (error) {
    console.error('💥 予期しないエラー:', error)
  }
}

createUserProfilesTable()