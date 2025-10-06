const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function upgradeToPermanent() {
  try {
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    const permanentPlanId = 'a3e0d7f0-68d1-402b-842f-71dc28d784ad'; // 永久アカウント
    
    console.log('🚀 Upgrading user to permanent plan...');
    console.log('👤 User ID:', userId);
    console.log('📋 New Plan ID:', permanentPlanId);
    
    // Update subscription to permanent plan and reset generation count
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: permanentPlanId,
        generation_count: 0, // Reset generation count to 0
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select('*');

    if (error) {
      console.error('❌ Error upgrading subscription:', error);
    } else {
      console.log('✅ Subscription upgraded successfully!');
      console.log('📊 Updated subscription:', data);
      
      // Verify the change
      const { data: verification, error: verifyError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            name,
            generation_limit,
            description
          )
        `)
        .eq('user_id', userId);
        
      if (verifyError) {
        console.error('❌ Error verifying upgrade:', verifyError);
      } else {
        console.log('🔍 Verification - Current subscription details:');
        console.log(JSON.stringify(verification, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

upgradeToPermanent();