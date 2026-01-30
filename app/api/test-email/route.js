import { testEmailConnection } from '@/lib/email-gmail'

export async function GET() {
  try {
    const result = await testEmailConnection()
    
    if (result) {
      return Response.json({ 
        success: true, 
        message: 'Test email sent successfully!' 
      })
    } else {
      return Response.json({ 
        success: false, 
        message: 'Failed to send test email' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test error:', error)
    return Response.json({ 
      success: false, 
      message: 'Error: ' + error.message 
    }, { status: 500 })
  }
}
