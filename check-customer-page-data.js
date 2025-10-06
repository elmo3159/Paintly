const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkCustomerPageData() {
  try {
    const targetPageId = 'b39feb84-9fdb-45db-a71c-0c0dac128136';
    
    console.log('🔍 Checking customer page data for ID:', targetPageId);
    
    // Check specific customer page with service role key
    const { data: targetPage, error: targetError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', targetPageId);
      
    if (targetError) {
      console.error('❌ Error fetching target page (service role):', targetError);
    } else {
      console.log('✅ Target page found (service role):', targetPage);
    }
    
    // Check with anon key to see if RLS is blocking
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM');
    
    const { data: anonPage, error: anonError } = await anonSupabase
      .from('customer_pages')
      .select('*')
      .eq('id', targetPageId);
      
    if (anonError) {
      console.error('❌ Error fetching target page (anon key):', anonError);
    } else {
      console.log('✅ Target page found (anon key):', anonPage);
    }
    
    // Check user's subscription info
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (
          name,
          generation_limit,
          description
        )
      `)
      .eq('user_id', userId)
      .single();
      
    if (subError) {
      console.error('❌ Error fetching subscription:', subError);
    } else {
      console.log('📋 Subscription info:', subscription);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkCustomerPageData();