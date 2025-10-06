const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixNewCustomerPage() {
  try {
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    const missingPageId = 'b39feb84-9fdb-45db-a71c-0c0dac128136';
    
    console.log('🔍 Checking if customer page exists:', missingPageId);
    
    // Check if the page already exists
    const { data: existingPage, error: checkError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', missingPageId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing page:', checkError);
      return;
    }
    
    if (existingPage) {
      console.log('✅ Customer page already exists:', existingPage);
      return;
    }
    
    console.log('➕ Creating missing customer page...');
    
    // Create the missing customer page
    const newRecord = {
      id: missingPageId,
      user_id: userId,
      title: '新規顧客 2025/9/25 - ジェットブラック',
      customer_email: null,
      customer_phone: null,
      customer_address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertedPage, error: insertError } = await supabase
      .from('customer_pages')
      .insert(newRecord)
      .select();
      
    if (insertError) {
      console.error('❌ Error creating customer page:', insertError);
    } else {
      console.log('✅ Customer page created successfully:', insertedPage);
      
      // Verify the creation
      const { data: verifyPage, error: verifyError } = await supabase
        .from('customer_pages')
        .select('*')
        .eq('id', missingPageId)
        .single();
        
      if (verifyError) {
        console.error('❌ Error verifying created page:', verifyError);
      } else {
        console.log('🎯 Verification successful:', verifyPage);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixNewCustomerPage();