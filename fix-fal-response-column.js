const { createClient } = require('@supabase/supabase-js');

async function fixFalResponseColumn() {
  console.log('🚀 Starting fal_response column fix...');
  
  // Set environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mockfjcakfzbzccabcgm.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';
  
  // Initialize Supabase service role client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    console.log('🔍 Testing if fal_response column exists...');
    
    // Test if fal_response column exists by trying to update a record
    const { data: existingRecords } = await supabase
      .from('generations')
      .select('id')
      .limit(1);
    
    if (!existingRecords || existingRecords.length === 0) {
      console.log('⚠️ No existing records found to test with');
      return;
    }
    
    const testRecordId = existingRecords[0].id;
    console.log('🧪 Testing with record ID:', testRecordId);
    
    // Try to update with fal_response
    const { error: updateError } = await supabase
      .from('generations')
      .update({ fal_response: { test: 'column_exists_check' } })
      .eq('id', testRecordId);
    
    if (updateError) {
      if (updateError.message.includes('fal_response')) {
        console.log('❌ fal_response column does not exist');
        console.log('🔧 Attempting to add fal_response column...');
        
        // Try to add the column using direct SQL
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({
              sql: 'ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS fal_response JSONB;'
            })
          });
          
          if (response.ok) {
            console.log('✅ Column addition API call successful');
            
            // Wait a moment for schema cache to update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Test again
            const { error: retestError } = await supabase
              .from('generations')
              .update({ fal_response: { test: 'column_added_verification' } })
              .eq('id', testRecordId);
            
            if (retestError) {
              console.error('❌ Column still not working after addition:', retestError.message);
            } else {
              console.log('✅ fal_response column successfully added and working!');
            }
          } else {
            const errorText = await response.text();
            console.error('❌ API call failed:', response.status, errorText);
          }
        } catch (apiError) {
          console.error('❌ API call error:', apiError.message);
        }
      } else {
        console.error('❌ Update failed for other reason:', updateError.message);
      }
    } else {
      console.log('✅ fal_response column already exists and working!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixFalResponseColumn();