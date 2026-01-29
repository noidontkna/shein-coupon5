// Simple email service using EmailJS
// Sign up at https://www.emailjs.com/ - Free for 200 emails/month

export async function sendCouponEmail(order, couponCode) {
  try {
    // Load EmailJS browser SDK dynamically
    const emailjs = await import('@emailjs/browser')
    
    console.log(" Preparing email for:", order.email)
    
    const templateParams = {
      to_name: order.upi_name,
      to_email: order.email,
      order_id: order.id.substring(0, 8),
      coupon_code: couponCode,
      amount: order.amount,
      discount: Math.floor(order.package/10),
      package: order.package,
      date: new Date(order.created_at).toLocaleDateString()
    }
    
    // Send using EmailJS
    const response = await emailjs.send(
      'service_your_service_id',  // Replace with your EmailJS Service ID
      'template_your_template_id', // Replace with your EmailJS Template ID
      templateParams,
      'your_public_key'  // Replace with your EmailJS Public Key
    )
    
    console.log(" Email sent! Status:", response.status)
    return true
    
  } catch (error) {
    console.error(" Email failed:", error)
    return false
  }
}

export async function sendRejectionEmail(order) {
  try {
    const emailjs = await import('@emailjs/browser')
    
    const templateParams = {
      to_name: order.upi_name,
      to_email: order.email,
      order_id: order.id.substring(0, 8),
      track_url: 'http://localhost:3000/track'
    }
    
    const response = await emailjs.send(
      'service_your_service_id',
      'template_your_template_id',
      templateParams,
      'your_public_key'
    )
    
    console.log(" Rejection email sent!")
    return true
    
  } catch (error) {
    console.error(" Rejection email failed:", error)
    return false
  }
}
