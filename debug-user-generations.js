// Debug script to find actual customer_page_id for user
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function findUserGenerations() {
  console.log('🔍 Searching for generations by user_id...')
  
  const userId = 'e7078ac4-f843-4026-921d-b869ba37d335'
  
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Found ${data?.length || 0} generations for user ${userId}`)
  
  data?.forEach((item, index) => {
    console.log(`\n📝 Generation ${index + 1}:`)
    console.log(`  ID: ${item.id}`)
    console.log(`  Customer Page ID: ${item.customer_page_id}`)
    console.log(`  Status: ${item.status}`)
    console.log(`  Created: ${item.created_at}`)
    console.log(`  Original Image URL: ${item.original_image_url?.substring(0, 100)}...`)
    console.log(`  Generated Image URL: ${item.generated_image_url?.substring(0, 100)}...`)
    console.log(`  Wall Color: ${item.wall_color}`)
    console.log(`  Roof Color: ${item.roof_color}`)
  })
  
  // Get unique customer_page_ids
  const customerPageIds = [...new Set(data?.map(item => item.customer_page_id))]
  console.log(`\n🎯 Unique Customer Page IDs found:`, customerPageIds)
}

findUserGenerations().catch(console.error)