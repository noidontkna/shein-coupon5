import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { orderId, status, couponCode } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status required' },
        { status: 400 }
      )
    }
    
    const updates = { 
      status,
      updated_at: new Date().toISOString()
    }
    
    if (status === 'approved' && couponCode) {
      updates.coupon_code = couponCode
    }
    
    const { error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)

    if (error) throw error
    
    // TODO: Send email notification here
    console.log(`Order ${orderId} ${status}. Coupon: ${couponCode || 'none'}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Order ${status} successfully` 
    })
    
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to update order' 
    }, { status: 500 })
  }
}
