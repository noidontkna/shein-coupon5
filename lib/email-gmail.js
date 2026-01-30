import nodemailer from 'nodemailer'

// Create transporter with your credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'shein.coupons.service@gmail.com',
    pass: (process.env.GMAIL_APP_PASSWORD || 'lacb bicx fyfz ubnz').replace(/\s/g, '') // Remove spaces
  },
  pool: true,
  maxConnections: 1,
  rateDelta: 10000, // 10 seconds between emails
  rateLimit: 6 // 6 emails per minute max
})

// Test connection
transporter.verify((error) => {
  if (error) {
    console.error(' Email server connection failed:', error)
  } else {
    console.log(' Email server is ready to send')
  }
})

// Email templates
const templates = {
  orderConfirmation: (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;"> Payment Received</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <p>Hello <strong>${order.upi_name}</strong>,</p>
        <p>We have received your payment of <strong>₹${order.amount}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${order.id.substring(0, 8)}...</p>
          <p><strong>UTR Number:</strong> ${order.utr || 'Not provided'}</p>
          <p><strong>Amount Paid:</strong> ₹${order.amount}</p>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        
        <p><strong>Status:</strong> Pending review by admin</p>
        <p><strong>Expected coupon delivery:</strong> Within 24 hours</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p>You can track your order anytime: <a href="https://shein-coupon.vercel.app/track">Track Order</a></p>
          <p><small>If you have any questions, reply to this email.</small></p>
        </div>
      </div>
    </div>
  `,

  couponDelivery: (order, couponCode) => {
    // Calculate discount based on order amount
    const discount = Math.floor(order.amount * 2) // Assuming 20% discount
    const minOrderAmount = order.amount * 2.5 // Minimum order amount for coupon
    
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;"> Your Shein Coupon is Ready!</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <p>Hello <strong>${order.upi_name}</strong>,</p>
        <p>Your order <strong>#${order.id.substring(0, 8)}</strong> has been approved!</p>
        
        <div style="background: #fff3cd; border: 2px dashed #ffc107; padding: 30px; margin: 25px 0; text-align: center; border-radius: 10px;">
          <h2 style="color: #856404; margin-top: 0;">Your Coupon Code</h2>
          <div style="font-size: 36px; font-weight: bold; color: #d63384; letter-spacing: 4px; margin: 15px 0;">
            ${couponCode}
          </div>
          <p style="color: #856404;">Valid for ₹${discount} off on orders above ₹${minOrderAmount}</p>
        </div>
        
        <h3> How to Use Your Coupon</h3>
        <ol style="padding-left: 20px;">
          <li>Go to <a href="https://shein.com">shein.com</a></li>
          <li>Add items worth ₹${minOrderAmount} or more to your cart</li>
          <li>Proceed to checkout</li>
          <li>Paste <strong>${couponCode}</strong> in the coupon box</li>
          <li>Enjoy your ₹${discount} discount!</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://shein.com" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Shop Now on Shein
          </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Order Summary</h4>
          <p><strong>Order ID:</strong> ${order.id.substring(0, 8)}...</p>
          <p><strong>Amount Paid:</strong> ₹${order.amount}</p>
          <p><strong>Discount:</strong> ₹${discount} off</p>
        </div>
      </div>
    </div>
  `},

  orderRejected: (order) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #dc3545;"> Order Status Update</h2>
      <p>Hello ${order.upi_name},</p>
      <p>Your order <strong>#${order.id.substring(0, 8)}</strong> has been <strong>rejected</strong>.</p>
      
      <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Reason:</strong> Payment verification needed</p>
      </div>
      
      <h3>What to do next:</h3>
      <ol>
        <li>Go to: <a href="https://shein-coupon.vercel.app/track">Track Order Page</a></li>
        <li>Enter your UTR: ${order.utr}</li>
        <li>Click "Reapply" and upload clear payment screenshot</li>
        <li>You have <strong>1 reapply chance</strong></li>
      </ol>
      
      <p>If you believe this is an error, reply to this email with your payment screenshot.</p>
    </div>
  `
}

// Email sending functions
export async function sendOrderConfirmation(order) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Shein Coupons" <shein.coupons.service@gmail.com>',
      to: order.email,
      subject: ` Payment Received - Order #${order.id.substring(0, 8)}`,
      html: templates.orderConfirmation(order),
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log(' Order confirmation sent:', info.messageId)
    return true
  } catch (error) {
    console.error(' Order confirmation failed:', error)
    return false
  }
}

export async function sendCouponEmail(order, couponCode) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Shein Coupons" <shein.coupons.service@gmail.com>',
      to: order.email,
      subject: ` Your Shein Coupon Code: ${couponCode}`,
      html: templates.couponDelivery(order, couponCode),
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log(' Coupon email sent:', info.messageId, 'to:', order.email)
    return true
  } catch (error) {
    console.error(' Coupon email failed:', error)
    return false
  }
}

export async function sendRejectionEmail(order) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Shein Coupons" <shein.coupons.service@gmail.com>',
      to: order.email,
      subject: ` Order #${order.id.substring(0, 8)} Needs Verification`,
      html: templates.orderRejected(order),
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log(' Rejection email sent:', info.messageId, 'to:', order.email)
    return true
  } catch (error) {
    console.error(' Rejection email failed:', error)
    return false
  }
}

// Test function
export async function testEmailConnection() {
  try {
    const testEmail = {
      from: process.env.EMAIL_FROM || '"Shein Coupons" <shein.coupons.service@gmail.com>',
      to: process.env.GMAIL_USER || 'shein.coupons.service@gmail.com',
      subject: ' Shein Coupons - Email Test',
      html: '<h1>Test Successful!</h1><p>Your email system is working.</p>'
    }
    
    const info = await transporter.sendMail(testEmail)
    console.log(' Test email sent:', info.messageId)
    return true
  } catch (error) {
    console.error(' Test email failed:', error)
    return false
  }
}
