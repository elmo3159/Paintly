const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mockfjcakfzbzccabcgm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk'
);

console.log('🔍 Checking generations table structure...');

(async () => {
  try {
    // Get recent generations with all fields
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .limit(3)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📊 Recent generations count:', data?.length || 0);

    if (data && data.length > 0) {
      console.log('🗃️ Table columns:', Object.keys(data[0]));
      console.log('📋 Sample record:');
      const sample = data[0];
      Object.keys(sample).forEach(key => {
        const value = sample[key];
        console.log(`  ${key}: ${typeof value} - ${String(value).substring(0, 100)}...`);
      });

      console.log('\n🎯 Prompt field analysis:');
      console.log('  hasPrompt:', !!sample.prompt);
      console.log('  promptType:', typeof sample.prompt);
      console.log('  promptLength:', sample.prompt?.length || 0);
      if (sample.prompt) {
        console.log('  promptPreview:', sample.prompt.substring(0, 200) + '...');
      }
    } else {
      console.log('⚠️ No generations found');
    }

    // Check for specific customer ID
    const customerId = 'e0b351e2-5633-4cb3-8db8-5efc217b5452';
    const { data: customerData, error: customerError } = await supabase
      .from('generations')
      .select('*')
      .eq('customer_page_id', customerId)
      .order('created_at', { ascending: false });

    console.log(`\n🎯 Generations for customer ${customerId}:`);
    console.log('  count:', customerData?.length || 0);

    if (customerData && customerData.length > 0) {
      customerData.forEach((item, index) => {
        console.log(`  Record ${index + 1}:`);
        console.log(`    id: ${item.id}`);
        console.log(`    status: ${item.status}`);
        console.log(`    hasPrompt: ${!!item.prompt}`);
        console.log(`    created_at: ${item.created_at}`);
        console.log(`    generated_image_url: ${item.generated_image_url ? 'Yes' : 'No'}`);
      });
    }

  } catch (err) {
    console.error('❌ Script error:', err);
  }
})();