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
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Checking Supabase connection and tables...\n');
  
  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('count')
    .limit(1);
  
  if (usersError) {
    console.log('❌ Users table:', usersError.message);
  } else {
    console.log('✅ Users table exists');
  }
  
  // Check plans table
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order');
  
  if (plansError) {
    console.log('❌ Plans table:', plansError.message);
  } else {
    console.log(`✅ Plans table exists with ${plans?.length || 0} plans`);
    if (plans && plans.length > 0) {
      console.log('   Plans found:', plans.map(p => p.name).join(', '));
    }
  }
  
  // Check customers table
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('count')
    .limit(1);
  
  if (customersError) {
    console.log('❌ Customers table:', customersError.message);
  } else {
    console.log('✅ Customers table exists');
  }
  
  // Check generations table (renamed from simulations)
  const { data: generations, error: generationsError } = await supabase
    .from('generations')
    .select('count')
    .limit(1);
  
  if (generationsError) {
    console.log('❌ Generations table:', generationsError.message);
  } else {
    console.log('✅ Generations table exists');
  }
  
  // Check subscriptions table
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('count')
    .limit(1);
  
  if (subscriptionsError) {
    console.log('❌ Subscriptions table:', subscriptionsError.message);
  } else {
    console.log('✅ Subscriptions table exists');
  }
  
  console.log('\n✅ Database structure verification complete!');
}

checkDatabase().catch(console.error);