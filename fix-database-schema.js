const { createClient } = require('@supabase/supabase-js');

async function fixDatabaseSchema() {
  console.log('🚀 Starting database schema fix...');
  
  // Initialize Supabase service role client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Check if generations table exists and try to query it
    console.log('🔍 Checking generations table...');
    
    const { data: testData, error: testError } = await supabase
      .from('generations')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error accessing generations table:', testError);
      return;
    }
    
    console.log('✅ generations table accessible');
    
    // Try to add fal_response column directly using SQL
    console.log('⚠️ Adding fal_response column...');
    
    try {
      // Create a dummy record to test if fal_response column exists
      const { error: insertError } = await supabase
        .from('generations')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          customer_page_id: '00000000-0000-0000-0000-000000000000', 
          wall_color: 'test',
          roof_color: 'test',
          door_color: 'test',
          weather: 'test',
          prompt: 'test',
          status: 'test',
          fal_response: { test: true }
        })
        .select();
      
      if (insertError) {
        if (insertError.message.includes('fal_response')) {
          console.log('⚠️ fal_response column does not exist. Attempting to add it...');
          
          // Use SQL query to add the column
          const { error: sqlError } = await supabase
            .from('generations')
            .select('*')
            .limit(0); // Get schema without data
            
          console.log('Current schema error (expected):', sqlError);
          
          // Direct SQL approach using raw query
          console.log('🔧 Using direct SQL approach...');
          const { data: sqlResult, error: alterError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS fal_response JSONB;'
          });
          
          if (alterError) {
            console.error('❌ SQL ALTER error:', alterError);
            
            // Alternative: Try using supabase-js API
            console.log('🔄 Trying alternative API approach...');
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
            
            const result = await response.json();
            console.log('Direct API result:', result);
            
          } else {
            console.log('✅ SQL ALTER successful:', sqlResult);
          }
        } else {
          console.log('❌ Insert failed for other reason:', insertError);
        }
      } else {
        console.log('✅ fal_response column already exists and working');
      }
      
      // Clean up test record
      await supabase
        .from('generations')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
        
    } catch (error) {
      console.error('❌ Error in column check:', error);
    }
    
    // Final test - try to update a record with fal_response
    console.log('🔍 Final verification test...');
    const { data: existingRecords } = await supabase
      .from('generations')
      .select('id')
      .limit(1);
    
    if (existingRecords && existingRecords.length > 0) {
      const { error: updateError } = await supabase
        .from('generations')
        .update({ fal_response: { test: 'verification' } })
        .eq('id', existingRecords[0].id);
      
      if (updateError) {
        console.error('❌ Final verification failed:', updateError);
      } else {
        console.log('✅ Final verification successful - fal_response column is working!');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
} = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'generations')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
      return;
    }
    
    console.log('📋 Current generations table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });
    
    // Check if fal_response column exists
    const falResponseExists = columns.some(col => col.column_name === 'fal_response');
    
    if (falResponseExists) {
      console.log('✅ fal_response column already exists');
    } else {
      console.log('⚠️ fal_response column is missing. Adding it...');
      
      // Add fal_response column
      const { error: alterError } = await supabase.rpc('exec_sql', {
        query: 'ALTER TABLE generations ADD COLUMN fal_response JSONB;'
      });
      
      if (alterError) {
        console.error('❌ Error adding fal_response column:', alterError);
        
        // Try alternative approach using raw SQL
        console.log('🔄 Trying alternative approach...');
        const { error: sqlError } = await supabase
          .from('generations')
          .insert([])  // This will trigger schema validation
          .select();
        
        console.log('SQL Error details:', sqlError);
      } else {
        console.log('✅ fal_response column added successfully');
      }
    }
    
    // Verify the fix
    console.log('🔍 Verifying the fix...');
    const { data: updatedColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'generations')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError);
    } else {
      console.log('📋 Updated generations table columns:');
      updatedColumns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
      
      const nowHasFalResponse = updatedColumns.some(col => col.column_name === 'fal_response');
      if (nowHasFalResponse) {
        console.log('✅ Database schema fix completed successfully!');
      } else {
        console.log('❌ fal_response column still missing after attempted fix');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Set environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mockfjcakfzbzccabcgm.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

fixDatabaseSchema();