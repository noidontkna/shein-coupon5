"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Copy, Mail, User, CreditCard, ArrowLeft } from 'lucide-react'
import QRCode from 'react-qr-code'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const UPI_ID = 'aayushrawat07@ptaxis'

export default function BuyPage() {
  const params = useParams()
  const router = useRouter()
  const amount = parseInt(params.amount)
  
  const [formData, setFormData] = useState({
    email: '',
    upi_name: '',
    utr: ''
  })
  const [loading, setLoading] = useState(false)

  // Generate UPI payment string
  const upiPaymentString = `upi://pay?pa=${UPI_ID}&pn=Aayush%20Rawat&am=${amount}&cu=INR`

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID)
    toast.success('UPI ID copied to clipboard!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          email: formData.email,
          upi_name: formData.upi_name,
          amount: amount,
          utr: formData.utr,
          package: amount,
          status: 'pending'
        }])
        .select()
        .single()
      
      if (error) throw error
      
      toast.success('Order submitted successfully! Check your email for updates.')
      setFormData({ email: '', upi_name: '', utr: '' })
      
      // Redirect to track page
      setTimeout(() => {
        router.push(`/track`)
      }, 2000)
      
    } catch (error) {
      console.error('Order submission error:', error)
      toast.error('Failed to submit order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Packages
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Pay ₹{amount} to Get Your Coupon
          </h1>
          <p className="text-gray-600">
            Complete payment and submit details to receive your Shein coupon code
          </p>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Scan QR Code to Pay
          </h2>
          
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-xl border-4 border-purple-200 mb-6 shadow-lg">
              <QRCode
                value={upiPaymentString}
                size={256}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
              />
            </div>
            
            <p className="text-gray-600 mb-4">Scan this QR with PhonePe, GPay, Paytm, or any UPI app</p>
            
            {/* UPI ID Box */}
            <div className="mt-4 p-4 bg-gray-100 rounded-xl w-full max-w-md">
              <p className="text-sm text-gray-600 mb-2 font-medium">UPI ID:</p>
              <div className="flex items-center justify-between">
                <code className="font-mono text-lg font-bold text-gray-800 break-all">
                  {UPI_ID}
                </code>
                <button
                  onClick={handleCopyUPI}
                  className="ml-4 bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 flex-shrink-0"
                  title="Copy UPI ID"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Payment Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl w-full max-w-md">
              <p className="text-yellow-800 font-bold text-center mb-2">
                ⚠️ Important Payment Instructions
              </p>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Send <strong>exact amount: ₹{amount}</strong></li>
                <li>• UPI Name: <strong>Aayush Rawat</strong></li>
                <li>• Save payment screenshot after transaction</li>
                <li>• Enter correct UTR number below</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <Mail className="inline w-5 h-5 mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            {/* UPI Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <User className="inline w-5 h-5 mr-2" />
                UPI Name (as shown in payment) *
              </label>
              <input
                type="text"
                required
                value={formData.upi_name}
                onChange={(e) => setFormData({...formData, upi_name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter exact name shown in UPI app"
              />
            </div>

            {/* UTR Number */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <CreditCard className="inline w-5 h-5 mr-2" />
                UTR Number (12-16 digits) *
              </label>
              <input
                type="text"
                required
                value={formData.utr}
                onChange={(e) => setFormData({...formData, utr: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="1234567890123456"
                pattern="[0-9]{12,16}"
                title="12-16 digit UTR number"
              />
              <p className="text-sm text-gray-500 mt-2">
                Find UTR in your bank/UPI app after payment
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting Order...' : 'Submit Order'}
            </button>
          </form>

          {/* Important Notes */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">📋 Important:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>1. Save payment screenshot for verification</li>
              <li>2. Coupon code emailed within 24 hours after approval</li>
              <li>3. Check spam folder if email not received</li>
              <li>4. Track order status anytime at /track</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Shein Coupon Codes. All rights reserved.</p>
          <p className="mt-1">Need help? Contact support with your UTR number</p>
        </div>
      </div>
    </div>
  )
}