import { supabase } from "@/lib/supabase"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, upi_name, amount, utr, package: pkg } = body
    
    // Validate required fields
    if (!email || !upi_name || !amount || !utr) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Insert order into database
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          email,
          upi_name,
          amount: parseInt(amount),
          utr,
          package: parseInt(pkg || amount),
          status: "pending",
          reapply_used: false
        }
      ])
      .select()
      .single()
    
    if (error) throw error
    
    return Response.json(
      { 
        success: true, 
        message: "Order created successfully",
        order: data
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error("API Error:", error)
    return Response.json(
      { 
        error: "Failed to create order",
        details: error.message 
      },
      { status: 500 }
    )
  }
}
