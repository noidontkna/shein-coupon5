'use server'

import nodemailer from 'nodemailer'

// Create transporter (SERVER SIDE ONLY)
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '')
    }
  })
}

// Server Action: Test Email
export async function sendTestEmail() {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Shein Coupons <shein.coupons.service@gmail.com>',
      to: process.env.GMAIL_USER || 'shein.coupons.service@gmail.com',
      subject: '✅ Shein Coupons - Email Test',
      html: '<h2>Email System Working!</h2><p>Server actions are functioning correctly.</p>'
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Server Action: Send Order Confirmation
export async function sendOrderConfirmation(order) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: order.email,
      subject: `✅ Payment Received - Order #${order.id.substring(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #28a745;">Payment Confirmed!</h2>
          <p>Hello <strong>${order.upi_name}</strong>,</p>
          <p>We received your payment of <strong>₹${order.amount}</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Order ID:</strong> ${order.id.substring(0, 8)}...</p>
            <p><strong>UTR:</strong> ${order.utr}</p>
            <p><strong>Amount:</strong> ₹${order.amount}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>
          
          <p>Your coupon code will be emailed within 24 hours after approval.</p>
          <p>Track order: <a href="${process.env.NEXT_PUBLIC_APP_URL}/track">Click here</a></p>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Order confirmation sent to:', order.email)
    return { success: true }
  } catch (error) {
    console.error('❌ Order confirmation failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Server Action: Send Coupon Email
export async function sendCouponEmail(order, couponCode) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: order.email,
      subject: `🎉 Your Shein Coupon: ${couponCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #764ba2; text-align: center;">🎉 Your Coupon is Ready!</h1>
          
          <p>Hello <strong>${order.upi_name}</strong>,</p>
          <p>Your order <strong>#${order.id.substring(0, 8)}</strong> has been approved!</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                     color: white; padding: 25px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h2 style="margin: 0 0 15px 0;">Your Coupon Code</h2>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 3px;">
              ${couponCode}
            </div>
            <p style="margin-top: 10px;">₹${Math.floor(order.package/10)} off on orders above ₹${order.package}</p>
          </div>
          
          <h3>How to use:</h3>
          <ol>
            <li>Go to <a href="https://shein.com">shein.com</a></li>
            <li>Add items worth ₹${order.package}+ to cart</li>
            <li>At checkout, enter: <strong>${couponCode}</strong></li>
            <li>Enjoy ₹${Math.floor(order.package/10)} discount!</li>
          </ol>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Coupon email sent to:', order.email)
    return { success: true }
  } catch (error) {
    console.error('❌ Coupon email failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Server Action: Send Rejection Email
export async function sendRejectionEmail(order) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: order.email,
      subject: `⚠️ Order #${order.id.substring(0, 8)} Rejected`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #dc3545;">Order Rejected</h2>
          <p>Hello ${order.upi_name},</p>
          <p>Your order <strong>#${order.id.substring(0, 8)}</strong> was rejected.</p>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Reason:</strong> Payment verification failed</p>
          </div>
          
          <p><strong>What to do:</strong></p>
          <ul>
            <li>Go to: <a href="${process.env.NEXT_PUBLIC_APP_URL}/track">Track Order</a></li>
            <li>Click "Reapply"</li>
            <li>Upload clear payment screenshot</li>
          </ul>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Rejection email sent to:', order.email)
    return { success: true }
  } catch (error) {
    console.error('❌ Rejection email failed:', error.message)
    return { success: false, error: error.message }
  }
}