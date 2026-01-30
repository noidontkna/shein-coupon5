import { sendCouponEmail, sendRejectionEmail } from '@/lib/email-gmail'

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, order, couponCode } = body

    console.log('Email API called:', { action, orderId: order?.id, couponCode })

    if (!action || !order) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let result = false
    
    if (action === 'approve') {
      if (!couponCode) {
        return Response.json({ error: 'Coupon code required for approval' }, { status: 400 })
      }
      result = await sendCouponEmail(order, couponCode)
    } else if (action === 'reject') {
      result = await sendRejectionEmail(order)
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    console.log('Email result:', result)
    return Response.json({ success: result })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      error: 'Failed to send email', 
      details: error.message 
    }, { status: 500 })
  }
}
