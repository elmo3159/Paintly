const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mockfjcakfzbzccabcgm.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk'
);

async function checkPromptData() {
  console.log('🔍 Checking prompt data in database...');
  
  const { data, error } = await supabase
    .from('generations')
    .select('id, created_at, prompt, status')
    .eq('customer_page_id', '009e75c8-b18d-4583-8b77-ec2623c575ee')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📊 Latest 3 generations from DB:');
  data.forEach((item, index) => {
    console.log(`--- Generation ${index + 1} (ID: ${item.id}) ---`);
    console.log(`  created_at: ${item.created_at}`);
    console.log(`  status: ${item.status}`);
    console.log(`  hasPrompt: ${!!item.prompt}`);
    console.log(`  promptLength: ${item.prompt?.length || 0}`);
    console.log(`  promptPreview: ${item.prompt?.substring(0, 100) || 'NO PROMPT'}...`);
    console.log('');
  });
}

checkPromptData().catch(console.error);