const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log('🔍 Checking Supabase data...\n');
  
  // Check users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.log('❌ Cannot access admin users (expected with anon key)');
  }
  
  // Check auth session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('📋 Current session:', session ? 'Logged in' : 'No session');
  
  // Check customers table
  console.log('\n📊 Customers table:');
  const { data: customers, error: customersError, count } = await supabase
    .from('customers')
    .select('*', { count: 'exact' });
  
  if (customersError) {
    console.error('❌ Error fetching customers:', customersError);
  } else {
    console.log('Total customers:', count);
    if (customers && customers.length > 0) {
      console.log('Sample customer:', customers[0]);
    }
  }
  
  // Check generations table
  console.log('\n🎨 Generations table:');
  const { data: generations, error: generationsError, count: genCount } = await supabase
    .from('generations')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (generationsError) {
    console.error('❌ Error fetching generations:', generationsError);
  } else {
    console.log('Total generations:', genCount);
    if (generations && generations.length > 0) {
      console.log('Sample generation IDs:', generations.map(g => g.id));
    }
  }
  
  // Check subscriptions
  console.log('\n💳 Subscriptions table:');
  const { data: subscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(5);
    
  if (subsError) {
    console.error('❌ Error fetching subscriptions:', subsError);
  } else {
    console.log('Subscriptions found:', subscriptions?.length || 0);
  }
  
  // Try to insert a test customer
  console.log('\n🧪 Attempting to insert test customer...');
  const testCustomer = {
    id: '009e75c8-b18d-4583-8b77-ec2623c575ee',
    name: '佐藤様邸',
    address: '東京都渋谷区テスト1-2-3',
    notes: 'テスト顧客データ',
    created_at: new Date().toISOString(),
    user_id: 'e7078ac4-f843-4026-921d-b869ba37d335' // The user ID from sidebar
  };
  
  const { data: insertResult, error: insertError } = await supabase
    .from('customers')
    .upsert(testCustomer, { onConflict: 'id' })
    .select();
    
  if (insertError) {
    console.error('❌ Error inserting customer:', insertError);
  } else {
    console.log('✅ Customer inserted/updated:', insertResult);
  }
}

checkData().catch(console.error);
