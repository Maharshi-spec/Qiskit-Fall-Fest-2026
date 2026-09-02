const { createClient } = require('@supabase/supabase-js')
const { supabaseUrl, supabaseServiceRoleKey } = require('./env')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[SUPABASE] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

module.exports = {
  supabase,
}
