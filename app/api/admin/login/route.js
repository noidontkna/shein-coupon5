import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const supabaseUrl = 'https://pdxonykfylkgnxnxrgmd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBahYmFzZSIsInJlZiI6InBkeG9ueWtmeWxrZ254bnhyZ21kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY4OTI5MSwiZXhwIjoyMDg1MjY1MjkxfQ.FKR1s7zn7oiv2ax57Ea75ZEyv-Fgf777JKRRO9Ytl8g'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request) {
  try {
    const { username, password } = await request.json()
    
    // Get admin user from database
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error || !admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Verify password (use bcrypt.compare in production)
    // For now, simple comparison
    if (password !== 'admin123') { // Replace with bcrypt.compare
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Create session token
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
    
    return NextResponse.json({
      success: true,
      token,
      user: { username }
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
