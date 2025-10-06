const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixCustomers() {
  console.log('🔍 Checking customers table...\n');
  
  // First, check what columns exist
  const { data: emptySelect, error: selectError } = await supabase
    .from('customers')
    .select('*')
    .limit(0);
    
  console.log('Select error (if any):', selectError);
  
  // Insert test customers with title field
  const testCustomers = [
    {
      id: '009e75c8-b18d-4583-8b77-ec2623c575ee',
      title: '佐藤様邸',
      user_id: 'e7078ac4-f843-4026-921d-b869ba37d335'
    },
    {
      id: '1acfee5e-8850-4477-bf0b-10ac03b10c4b',
      title: '新規顧客 2025/9/25',
      user_id: 'e7078ac4-f843-4026-921d-b869ba37d335'
    },
    {
      id: '56cd4a9f-ee95-4096-aac7-ae3358e3d168',
      title: '新規顧客 2025/9/25',
      user_id: 'e7078ac4-f843-4026-921d-b869ba37d335'
    },
    {
      id: 'b200dfa6-1f05-4d92-b794-838cf784dbe7',
      title: '新規顧客 2025/9/15',
      user_id: 'e7078ac4-f843-4026-921d-b869ba37d335'
    }
  ];
  
  console.log('📝 Inserting test customers...');
  
  for (const customer of testCustomers) {
    const { data, error } = await supabase
      .from('customers')
      .upsert(customer, { onConflict: 'id' })
      .select();
      
    if (error) {
      console.error(`❌ Error inserting ${customer.title}:`, error.message);
    } else {
      console.log(`✅ Inserted/Updated: ${customer.title}`);
    }
  }
  
  // Verify the data
  console.log('\n📊 Final verification:');
  const { data: allCustomers, count } = await supabase
    .from('customers')
    .select('*', { count: 'exact' });
    
  console.log(`Total customers in database: ${count}`);
  if (allCustomers && allCustomers.length > 0) {
    console.log('\nCustomer data:');
    allCustomers.forEach(c => {
      console.log(`- ID: ${c.id}, Title: ${c.title || c.name || 'N/A'}`);
    });
  }
  
  // Now check generations table
  console.log('\n🎨 Checking generations...');
  const { data: gens, count: genCount } = await supabase
    .from('generations')
    .select('*', { count: 'exact' })
    .limit(5);
    
  console.log(`Total generations: ${genCount}`);
  if (gens && gens.length > 0) {
    console.log('Sample generations:', gens.map(g => ({ 
      id: g.id, 
      customer_id: g.customer_id,
      created_at: g.created_at 
    })));
  }
}

checkAndFixCustomers().catch(console.error);
