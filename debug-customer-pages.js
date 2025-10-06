const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debugCustomerPages() {
  try {
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    
    console.log('🔍 Debugging customer pages and subscriptions for user:', userId);
    
    // Check current subscription
    const { data: currentSub, error: subError } = await supabase
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
      console.log('✅ Current subscription:', currentSub);
    }
    
    // Check customer pages
    const { data: customerPages, error: pagesError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('user_id', userId);
      
    if (pagesError) {
      console.error('❌ Error fetching customer pages:', pagesError);
    } else {
      console.log('📄 Customer pages:', customerPages);
    }
    
    // Check specific customer page
    const targetPageId = 'b851b42f-aa99-4375-a564-8c056d757506';
    const { data: targetPage, error: targetError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', targetPageId);
      
    if (targetError) {
      console.error('❌ Error fetching target page:', targetError);
    } else {
      console.log(`🎯 Target page ${targetPageId}:`, targetPage);
    }
    
    // Check all customer pages to find the correct one
    const { data: allPages, error: allError } = await supabase
      .from('customer_pages')
      .select('*')
      .limit(10);
      
    if (allError) {
      console.error('❌ Error fetching all pages:', allError);
    } else {
      console.log('📋 All customer pages sample:', allPages);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugCustomerPages();