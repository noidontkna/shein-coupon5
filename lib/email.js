// Simple email functions
export async function sendCouponEmail(order, couponCode) {
  console.log(" [TEST] Would email:", order.email, "Code:", couponCode)
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return true
}

export async function sendRejectionEmail(order) {
  console.log(" [TEST] Would send rejection to:", order.email)
  await new Promise(resolve => setTimeout(resolve, 500))
  return true
}
