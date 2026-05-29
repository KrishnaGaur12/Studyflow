import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oidwksdpkqgaxluatbdt.supabase.co'
const supabaseKey = 'sb_publishable_4uwC7YoRin7X64lyDJi7_g_EoZV49w0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function registerDemo() {
  console.log('Registering demo account...')
  const { data, error } = await supabase.auth.signUp({
    email: 'demo@studyflow.com',
    password: 'demo12345',
  })
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Success! Data:', data)
  }
}

registerDemo()
