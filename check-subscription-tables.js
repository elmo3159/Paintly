const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkSubscriptionTables() {
  try {
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    
    console.log('🔍 Checking subscription and plan tables...');
    
    // Check plans table
    const { data: plansData, error: plansError } = await supabase
      .from('plans')
      .select('*');
      
    if (plansError) {
      console.log('❌ Error accessing plans table:', plansError);
    } else {
      console.log('✅ Plans table data:');
      console.log(plansData);
    }
    
    // Check subscriptions table  
    const { data: subsData, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);
      
    if (subsError) {
      console.log('❌ Error accessing subscriptions table:', subsError);
    } else {
      console.log('✅ User subscriptions data:');
      console.log(subsData);
    }
    
    // Check all subscriptions
    const { data: allSubsData, error: allSubsError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(5);
      
    if (allSubsError) {
      console.log('❌ Error accessing all subscriptions:', allSubsError);
    } else {
      console.log('✅ All subscriptions sample:');
      console.log(allSubsData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSubscriptionTables();