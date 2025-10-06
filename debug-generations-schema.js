// 履歴の画像表示問題を調査するためのスキーマ確認スクリプト
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugGenerationsSchema() {
  console.log('🔍 Supabase generations テーブル構造調査開始...')

  try {
    // 実際のデータサンプルを取得
    console.log('\n📊 実際のデータサンプル確認:')
    const { data: sampleData, error: sampleError } = await supabase
      .from('generations')
      .select('*')
      .limit(3)
      .order('created_at', { ascending: false })

    if (sampleError) {
      console.error('❌ サンプルデータ取得エラー:', sampleError)
    } else {
      console.log(`✅ 取得件数: ${sampleData?.length || 0}`)
      if (sampleData && sampleData.length > 0) {
        console.log('\n📋 フィールド一覧:')
        const firstRecord = sampleData[0]
        Object.keys(firstRecord).forEach(key => {
          const value = firstRecord[key]
          const type = typeof value
          const hasValue = value !== null && value !== undefined
          console.log(`  • ${key}: ${type} - ${hasValue ? '✓' : '✗'} - ${String(value).substring(0, 50)}...`)
        })

        console.log('\n🖼️ 画像URL関連フィールド詳細分析:')
        sampleData.forEach((record, index) => {
          console.log(`\n--- レコード ${index + 1} (ID: ${record.id}) ---`)
          console.log(`  original_image_url: ${record.original_image_url || 'null'}`)
          console.log(`  generated_image_url: ${record.generated_image_url || 'null'}`)
          
          // fal_responseフィールドの詳細確認
          if (record.fal_response) {
            console.log(`  fal_response type: ${typeof record.fal_response}`)
            if (typeof record.fal_response === 'object') {
              console.log(`  fal_response keys: ${Object.keys(record.fal_response).join(', ')}`)
              console.log(`  fal_response.imageUrl: ${record.fal_response.imageUrl || 'null'}`)
              console.log(`  fal_response.originalImageUrl: ${record.fal_response.originalImageUrl || 'null'}`)
              console.log(`  fal_response.hasImage: ${record.fal_response.hasImage}`)
            } else {
              console.log(`  fal_response content: ${String(record.fal_response).substring(0, 100)}...`)
            }
          } else {
            console.log(`  fal_response: null`)
          }
          
          console.log(`  status: ${record.status}`)
          console.log(`  created_at: ${record.created_at}`)
        })
      }
    }

    // テーブル情報取得（PostgreSQL特有のクエリ）
    console.log('\n🏗️ テーブル構造詳細:')
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'generations' })
      .single()

    if (columnError) {
      console.log('⚠️ カラム情報取得は失敗（RPC関数が未定義の可能性）')
      console.log('代わりに実際のデータから構造を推測します')
    } else {
      console.log('✅ カラム情報:', columnInfo)
    }

  } catch (error) {
    console.error('❌ 調査エラー:', error)
  }
}

debugGenerationsSchema()