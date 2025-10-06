const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixMissingCustomerPages() {
  try {
    console.log('🔍 Checking for missing customer pages...');
    
    // These are the customer page IDs that failed in the logs
    const missingPageIds = [
      'b851b42f-aa99-4375-a564-8c056d757506',
      '21cadf5d-0f3d-4369-8ed6-2d094c52303a'
    ];
    
    // User ID from the logs
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    const userId2 = 'e7078ac4-f843-4026-921d-b869ba37d335'; // Second user from logs
    
    // Check which pages already exist
    const { data: existingPages, error: checkError } = await supabase
      .from('customer_pages')
      .select('id')
      .in('id', missingPageIds);
      
    if (checkError) {
      console.error('❌ Error checking existing pages:', checkError);
      return;
    }
    
    const existingPageIds = existingPages.map(p => p.id);
    const actuallyMissingIds = missingPageIds.filter(id => !existingPageIds.includes(id));
    
    console.log('📋 Existing pages:', existingPageIds);
    console.log('❌ Missing pages:', actuallyMissingIds);
    
    // Create missing customer pages
    for (const pageId of actuallyMissingIds) {
      console.log(`📝 Creating customer page: ${pageId}`);
      
      // Determine which user this page belongs to based on the error logs
      const targetUserId = pageId === '21cadf5d-0f3d-4369-8ed6-2d094c52303a' ? userId2 : userId;
      
      const { error: insertError } = await supabase
        .from('customer_pages')
        .insert({
          id: pageId,
          user_id: targetUserId,
          title: `顧客ページ ${pageId.slice(-8)}`, // Use last 8 chars as title
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error(`❌ Error creating page ${pageId}:`, insertError);
      } else {
        console.log(`✅ Successfully created page ${pageId}`);
      }
    }
    
    // Verify all pages now exist
    console.log('\n🔍 Verifying all pages exist...');
    const { data: verifyPages, error: verifyError } = await supabase
      .from('customer_pages')
      .select('id, user_id, title, created_at')
      .in('id', missingPageIds);
      
    if (verifyError) {
      console.error('❌ Error verifying pages:', verifyError);
    } else {
      console.log('✅ All pages verified:', verifyPages);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixMissingCustomerPages();