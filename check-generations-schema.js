const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGenerationsSchema() {
  try {
    console.log('🔍 Checking generations table schema...')
    
    // Get all columns in generations table
    const { data, error } = await supabase
      .rpc('pg_get_columns', { table_name: 'generations' })
      
    if (error) {
      console.log('❌ RPC failed, trying direct query...')
      
      // Fallback: Try to get a sample record to see the structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('generations')
        .select('*')
        .limit(1)
        
      if (sampleError) {
        console.error('❌ Sample query also failed:', sampleError)
        return
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log('✅ Sample record structure:')
        console.log(JSON.stringify(sampleData[0], null, 2))
        
        // Check if prompt field exists
        const hasPromptField = 'prompt' in sampleData[0]
        console.log(`📝 Prompt field exists: ${hasPromptField}`)
        
        if (hasPromptField) {
          console.log('✅ Prompt field is already available in the database')
        } else {
          console.log('❌ Prompt field is missing - need to add it')
        }
      } else {
        console.log('⚠️ No records found in generations table')
      }
    } else {
      console.log('✅ Schema data:', data)
    }
  } catch (error) {
    console.error('❌ Error checking schema:', error)
  }
}

checkGenerationsSchema()