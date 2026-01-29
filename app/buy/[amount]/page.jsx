
"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { toast } from "react-hot-toast"

const QRCode = dynamic(() => import("qrcode"), { ssr: false })

export default function BuyPage() {
  const params = useParams()
  const router = useRouter()
  const amount = params?.amount || "500"
  const [qrCode, setQrCode] = useState("")
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const generateQR = async () => {
        try {
          const upiId = "yashchhibber@ptyes"
          const qrData = `upi://pay?pa=${upiId}&pn=Yash%20Chhibber&am=${amount}&cu=INR`
          const qr = await QRCode.toDataURL(qrData)
          setQrCode(qr)
        } catch (err) {
          console.error("QR Generation Error:", err)
        }
      }
      
      generateQR()
    }
  }, [amount])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = {
      email: e.target.email.value,
      upi_name: e.target.upi_name.value,
      package: parseInt(amount),
      amount: parseInt(amount),
      utr: e.target.utr.value
    }
    
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
        // Redirect to track page with order ID
        router.push(`/track?order=${result.orderId}`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
      console.error('Submission error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Pay ₹{amount} to Get Your Coupon
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Scan QR Code to Pay</h3>
              {qrCode ? (
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-xl border-2 border-gray-200 w-64 h-64 mx-auto flex items-center justify-center">
                  <p>Generating QR Code...</p>
                </div>
              )}
              
              <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                <p className="font-semibold">UPI ID:</p>
                <p className="text-lg font-mono text-purple-600 break-all">yashchhibber@ptyes</p>
                <p className="text-sm text-gray-600 mt-2">Send exact amount: <strong>₹{amount}</strong></p>
                <p className="text-xs text-gray-500 mt-1">UPI Name: Yash Chhibber</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Order Details</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500" 
                    placeholder="your@email.com" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">UPI Name (as shown in payment) *</label>
                  <input 
                    type="text" 
                    name="upi_name"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500" 
                    placeholder="Enter your UPI name" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">UTR Number (12 digits) *</label>
                  <input 
                    type="text" 
                    name="utr"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500" 
                    placeholder="Enter UTR from payment" 
                    required 
                    pattern="[A-Za-z0-9]{10,15}"
                    title="10-15 character UTR number"
                  />
                  <p className="text-sm text-gray-500 mt-2">Find UTR in your bank app after payment</p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Submit Order'}
                </button>
              </form>
              
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong><br/>
                  1. Save payment screenshot<br/>
                  2. Coupon emailed within 24 hours<br/>
                  3. Check spam folder if not received
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
