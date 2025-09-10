const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local file manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSql() {
  const sql = fs.readFileSync('create-generations-table.sql', 'utf8');
  
  console.log('Creating generations table...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Generations table created successfully!');
  } catch (err) {
    console.log('Note: Direct SQL execution not available via client library');
    console.log('\nPlease execute the following SQL in your Supabase SQL editor:');
    console.log('https://supabase.com/dashboard/project/mockfjcakfzbzccabcgm/sql');
    console.log('\nSQL file contents saved to: create-generations-table.sql');
    console.log('\n' + '='.repeat(50));
    console.log('Alternatively, the generations table will be created automatically');
    console.log('when the application first attempts to save a generation.');
  }
}

executeSql().catch(console.error);