const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debugCurrentUserVsData() {
  try {
    // Current logged in user (from console)
    const currentUserId = 'e7078ac4-f843-4026-921d-b869ba37d335';
    const targetPageId = '21cadf5d-0f3d-4369-8ed6-2d094c52303a';
    
    console.log('🔍 Current User ID:', currentUserId);
    console.log('🎯 Target Page ID:', targetPageId);
    
    // Check specific customer page 
    const { data: targetPage, error: pageError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', targetPageId)
      .single();
      
    if (pageError) {
      console.error('❌ Error fetching page:', pageError);
    } else {
      console.log('📄 Page data:', targetPage);
      console.log('🔐 Page User ID matches current user?', targetPage.user_id === currentUserId);
    }
    
    // Check what pages belong to current user
    const { data: userPages, error: userError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('user_id', currentUserId);
      
    if (userError) {
      console.error('❌ Error fetching user pages:', userError);
    } else {
      console.log('📋 Current user pages:', userPages);
      console.log('📊 Current user has', userPages.length, 'pages');
    }
    
    // Check what user owns the target page
    const { data: pageOwner, error: ownerError } = await supabase
      .from('customer_pages')
      .select(`
        *,
        auth.users!customer_pages_user_id_fkey (
          id,
          email
        )
      `)
      .eq('id', targetPageId)
      .single();
      
    if (ownerError) {
      console.error('❌ Error fetching page owner:', ownerError);
    } else {
      console.log('👤 Page owner info:', pageOwner);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugCurrentUserVsData();