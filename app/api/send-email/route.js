import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { to, subject, html, orderId } = body
    
    console.log(" Sending email to:", to)
    
    const { data, error } = await resend.emails.send({
      from: "Shein Coupons <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    })
    
    if (error) {
      console.error(" Email error:", error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    console.log(" Email sent! ID:", data.id)
    return NextResponse.json({ 
      success: true, 
      data: data,
      message: "Email sent successfully" 
    })
    
  } catch (error) {
    console.error(" Server error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
