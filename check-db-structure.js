const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Use raw SQL to get table information
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_info', {})
      .or('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');

    if (tablesError) {
      console.log('❌ Error getting tables via RPC, trying direct query...');
      
      // Try to list existing data from generation_history to understand structure
      const { data: historyData, error: historyError } = await supabase
        .from('generation_history')
        .select('*')
        .limit(3);
        
      if (historyError) {
        console.error('❌ Error querying generation_history:', historyError);
      } else {
        console.log('✅ generation_history table exists, sample data:');
        console.log(historyData);
      }
      
      // Try to check user information
      const { data: authUsers, error: authError } = await supabase
        .from('users')
        .select('*')
        .limit(3);
        
      if (authError) {
        console.log('❌ users table access error:', authError);
        
        // Try auth.users instead
        const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
        if (authErr) {
          console.error('❌ Error accessing auth users:', authErr);
        } else {
          console.log('✅ Auth users found:', authData.users.length, 'users');
          const targetUser = authData.users.find(u => u.id === 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd');
          console.log('🎯 Target user:', targetUser ? 'Found' : 'Not found');
        }
      } else {
        console.log('✅ users table data:');
        console.log(authUsers);
      }
    } else {
      console.log('✅ Database tables:', tables);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabase();