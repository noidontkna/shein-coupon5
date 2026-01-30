"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Copy, RefreshCw, AlertCircle, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrackPage() {
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [allOrders, setAllOrders] = useState([])
  const [showDebug, setShowDebug] = useState(false)

  // Load some orders on page load for debugging
  useEffect(() => {
    loadSampleOrders()
  }, [])

  const loadSampleOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, utr, email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      setAllOrders(data || [])
      console.log('Loaded sample orders:', data?.length || 0, 'orders')
      console.log('Sample order IDs:', data?.map(o => o.id.substring(0, 8) + '...'))
      console.log('Sample UTRs:', data?.map(o => o.utr || 'NULL'))
    } catch (error) {
      console.error('Failed to load sample orders:', error)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchInput.trim()) {
      toast.error('Please enter UTR number or Order ID')
      return
    }

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      console.log('🔍 Searching for:', searchInput)
      console.log('📊 Total orders in DB:', allOrders.length)
      
      // METHOD 1: Try exact match first
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`utr.eq.${searchInput},id.eq.${searchInput}`)
        .maybeSingle()

      console.log('Method 1 result:', data)
      console.log('Method 1 error:', error)

      // METHOD 2: If not found, try partial match
      if (!data) {
        console.log('Trying partial match...')
        const { data: partialData } = await supabase
          .from('orders')
          .select('*')
          .or(`utr.ilike.%${searchInput}%,id.ilike.%${searchInput}%,email.ilike.%${searchInput}%`)
          .maybeSingle()
        
        data = partialData
        console.log('Method 2 result:', data)
      }

      // METHOD 3: Search in all loaded orders (fallback)
      if (!data && allOrders.length > 0) {
        console.log('Searching in loaded orders...')
        const found = allOrders.find(o => 
          (o.utr && o.utr.includes(searchInput)) ||
          (o.id && o.id.includes(searchInput)) ||
          (o.email && o.email.includes(searchInput))
        )
        
        if (found) {
          // Get full order details
          const { data: fullData } = await supabase
            .from('orders')
            .select('*')
            .eq('id', found.id)
            .single()
          
          data = fullData
          console.log('Found via fallback:', data)
        }
      }

      if (data) {
        setOrder(data)
        toast.success('✅ Order found!')
        
        // Log success details
        console.log('🎯 FOUND ORDER:', {
          id: data.id,
          utr: data.utr,
          status: data.status,
          email: data.email
        })
      } else {
        setError(`No order found. Try one of these IDs: ${
          allOrders.slice(0, 3).map(o => o.id.substring(0, 8)).join(', ')
        }`)
        toast.error('Order not found')
        
        console.log('❌ NO ORDER FOUND. Available orders:', allOrders.map(o => ({
          id_short: o.id.substring(0, 8) + '...',
          utr: o.utr || 'NULL',
          email: o.email
        })))
      }
    } catch (error) {
      console.error('🔴 Search error:', error)
      setError(`Search error: ${error.message}`)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  const createTestOrder = async () => {
    try {
      const testOrder = {
        email: `test${Date.now()}@example.com`,
        upi_name: 'Test User',
        package: 500,
        amount: 500,
        utr: `TEST${Date.now().toString().slice(-8)}`,
        status: 'pending',
        coupon_code: null,
        reapply_used: false
      }
      
      const { data, error } = await supabase
        .from('orders')
        .insert([testOrder])
        .select()
        .single()
      
      if (error) throw error
      
      toast.success(`Test order created! UTR: ${testOrder.utr}`)
      setSearchInput(testOrder.utr)
      
      // Reload sample orders
      await loadSampleOrders()
    } catch (error) {
      console.error('Create test error:', error)
      toast.error('Failed to create test order')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your UTR number or Order ID to check status
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Search by UTR, Order ID, or Email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g., TEST123456 or order ID"
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 rounded-xl hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Search
                </button>
              </div>
              
              <div className="mt-2 text-sm text-gray-500">
  <p>Enter your UTR number or Order ID received via email</p>
</div>
            </div>
          </form>

          {/* Debug Button */}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <p className="text-gray-600">Order placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                
                <span className={`px-4 py-2 rounded-full font-bold ${
                  order.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : order.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                    <div className="flex items-center gap-2">
                      <code className="font-mono bg-gray-100 px-3 py-1 rounded">
                        {order.id.substring(0, 16)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(order.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-gray-800">{order.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">UTR Number</h3>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-gray-800">
                        {order.utr || 'Not provided'}
                      </p>
                      {order.utr && (
                        <button
                          onClick={() => copyToClipboard(order.utr)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                    <p className="text-2xl font-bold text-gray-800">₹{order.amount}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">UPI Name</h3>
                    <p className="text-gray-800">{order.upi_name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Package</h3>
                    <p className="text-gray-800">₹{order.package} for ₹{Math.floor(order.package/10)} off</p>
                  </div>
                </div>
              </div>

              {/* Coupon Code Section */}
              {order.status === 'approved' && order.coupon_code && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 mb-6">
                  <h3 className="text-lg font-bold text-green-800 mb-2">🎉 Your Coupon Code</h3>
                  <div className="flex items-center justify-between">
                    <code className="text-2xl font-bold text-green-700">
                      {order.coupon_code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(order.coupon_code)}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </button>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {order.status === 'pending' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700">
                    ⏳ Your order is pending review. You'll receive an email once approved.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debug Info */}
        {showDebug && (
          <div className="bg-gray-900 text-white rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">🔧 Debug Information</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-300">Database Info</h4>
                <p className="text-sm">Orders in database: {allOrders.length}</p>
                <p className="text-sm">Current search: "{searchInput}"</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-300">Sample Orders (First 3)</h4>
                <div className="text-sm space-y-2">
                  {allOrders.slice(0, 3).map((o, i) => (
                    <div key={i} className="bg-gray-800 p-3 rounded">
                      <p>ID: {o.id.substring(0, 16)}...</p>
                      <p>UTR: {o.utr || '(empty)'}</p>
                      <p>Email: {o.email}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-300">Check Console</h4>
                <p className="text-sm">Open browser console (F12) for detailed logs</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Where to find UTR?</h4>
              <p className="text-gray-600 text-sm">
                Check your UPI app (PhonePe, GPay, Paytm) in transaction history. 
                UTR is usually 12-16 digits.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">No Order ID?</h4>
              <p className="text-gray-600 text-sm">
                Order ID was sent to your email after purchase. 
                Check your spam folder if not found.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}