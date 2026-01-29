import { createClient } from '@supabase/supabase-js'

// CORRECT URL: pdxonykfylkgnxnxrgmd (not pdxonykfylkgnxnrgmd)
const supabaseUrl = 'https://pdxonykfylkgnxnxrgmd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeG9ueWtmeWxrZ254bnhyZ21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODkyOTEsImV4cCI6MjA4NTI2NTI5MX0.Zvk1c4UJTQDGeDGfNRgWceuiyfMVdZLKSDsfH6XI9gA'

console.log('Using Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

export const supabaseAdmin = supabase
