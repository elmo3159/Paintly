const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixRLSPolicy() {
  try {
    console.log('🔍 Checking RLS policies and fixing if necessary...');
    
    // First, test if the customer_page is visible via anon access
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM');
    
    const testUserId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    const problemPageId = 'b39feb84-9fdb-45db-a71c-0c0dac128136';
    
    console.log('👤 Testing anon access to customer_pages...');
    const { data: anonData, error: anonError } = await anonSupabase
      .from('customer_pages')
      .select('*')
      .eq('id', problemPageId);
    
    console.log('📊 Anon access result:', { data: anonData, error: anonError });
    
    // Now test with service role
    console.log('🔑 Testing service role access to customer_pages...');
    const { data: serviceData, error: serviceError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', problemPageId);
    
    console.log('📊 Service role result:', { data: serviceData, error: serviceError });
    
    if (anonError && !serviceError) {
      console.log('🚨 RLS is blocking anon access! Checking existing policies...');
      
      // Check existing policies
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'customer_pages');
        
      console.log('📋 Current policies:', policies);
      
      if (policyError) {
        console.error('❌ Failed to fetch policies:', policyError);
      }
      
      // Try to create or update the policy to allow user access
      console.log('🔧 Attempting to fix RLS policy...');
      
      const policySQL = `
        -- Enable RLS if not already enabled
        ALTER TABLE customer_pages ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policy if exists
        DROP POLICY IF EXISTS "Users can access their own customer pages" ON customer_pages;
        
        -- Create new policy that allows users to access their own customer pages
        CREATE POLICY "Users can access their own customer pages" ON customer_pages
          FOR ALL
          USING (auth.uid() = user_id);
        
        -- Also allow service role full access
        DROP POLICY IF EXISTS "Service role full access to customer_pages" ON customer_pages;
        CREATE POLICY "Service role full access to customer_pages" ON customer_pages
          FOR ALL
          TO service_role
          USING (true);
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { 
        sql: policySQL 
      });
      
      if (sqlError) {
        console.error('❌ Failed to execute policy SQL:', sqlError);
        
        // Try alternative approach - direct policy creation
        console.log('🔄 Trying alternative policy creation...');
        
        const { error: directError } = await supabase
          .from('customer_pages')
          .select('id')  // This should trigger policy evaluation
          .eq('user_id', testUserId)
          .limit(1);
          
        console.log('📊 Direct policy test result:', { error: directError });
        
      } else {
        console.log('✅ RLS policy updated successfully');
        
        // Test the fix
        console.log('🧪 Testing updated policy...');
        const { data: testData, error: testError } = await anonSupabase
          .from('customer_pages')
          .select('*')
          .eq('id', problemPageId);
          
        console.log('📊 Policy fix test result:', { data: testData, error: testError });
      }
    } else {
      console.log('✅ RLS is working correctly - looking for other issues...');
      
      // Check if there's a database constraint issue
      console.log('🔍 Checking foreign key constraints...');
      const { data: constraints, error: constraintError } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT 
              tc.constraint_name,
              tc.table_name,
              kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu 
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_name = 'generations';
          `
        });
        
      console.log('📋 Foreign key constraints:', constraints);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixRLSPolicy();