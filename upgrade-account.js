const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

// Service roleクライアントでRLSバイパス
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function upgradeAccount() {
  try {
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    
    console.log('🚀 Upgrading user account to permanent plan...');
    console.log('👤 User ID:', userId);
    
    const { data, error } = await supabase
      .from('user_plan_info')
      .upsert({
        user_id: userId,
        plan_name: '永久プラン',
        generation_limit: -1,
        current_generation_count: 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('❌ Error upgrading account:', error);
    } else {
      console.log('✅ Account upgraded successfully:', data);
      
      // 確認のため現在の情報を取得
      const { data: currentPlan, error: fetchError } = await supabase
        .from('user_plan_info')
        .select('*')
        .eq('user_id', userId);
        
      if (fetchError) {
        console.error('❌ Error fetching current plan:', fetchError);
      } else {
        console.log('🔍 Current plan info:', currentPlan);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

upgradeAccount();