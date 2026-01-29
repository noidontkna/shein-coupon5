"use client"
// Add this line at the TOP with other imports
import { sendCouponEmail, sendRejectionEmail } from '@/lib/email'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { LogOut, RefreshCw, Check, X, Eye, Mail } from 'lucide-react'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  
  // Order management
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  // Check existing auth on load
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    const authTime = sessionStorage.getItem('admin_auth_time')
    
    if (auth === 'true' && authTime) {
      const timeDiff = Date.now() - parseInt(authTime)
      if (timeDiff < 7200000) { // 2 hours
        setIsAuthenticated(true)
        fetchOrders()
      } else {
        sessionStorage.removeItem('admin_auth')
        sessionStorage.removeItem('admin_auth_time')
      }
    }
  }, [])

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    if (!isAuthenticated) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setOrders(data || [])
      calculateStats(data || [])
      
      console.log(`Fetched ${data?.length || 0} orders`)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const calculateStats = (orderList) => {
    const newStats = {
      total: orderList.length,
      pending: 0,
      approved: 0,
      rejected: 0
    }
    
    orderList.forEach(order => {
      if (order.status === 'pending') newStats.pending++
      if (order.status === 'approved') newStats.approved++
      if (order.status === 'rejected') newStats.rejected++
    })
    
    setStats(newStats)
  }

// Find and replace your updateOrderStatus function with this:
const updateOrderStatus = async (orderId, newStatus, couponCode = '') => {
  try {
    // Find the order in current state
    const orderToUpdate = orders.find(o => o.id === orderId)
    if (!orderToUpdate) {
      toast.error('Order not found')
      return
    }
    
    // Update database
    const updates = { status: newStatus }
    if (couponCode) updates.coupon_code = couponCode
    
    const { error: dbError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
    
    if (dbError) throw dbError
    
    // Send email based on status
    let emailSent = false
    
    if (newStatus === 'approved' && couponCode) {
      emailSent = await sendCouponEmail(orderToUpdate, couponCode)
    } else if (newStatus === 'rejected') {
      emailSent = await sendRejectionEmail(orderToUpdate)
    }
    
    // Show appropriate message
    if (emailSent) {
      toast.success(`Order ${newStatus} and email sent!`)
    } else {
      toast.success(`Order marked as ${newStatus}`)
    }
    
    // Refresh the orders list
    await fetchOrders()
    
  } catch (error) {
    console.error('Error updating order:', error)
    toast.error('Failed to update order')
  }
}

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Get password from environment
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'yash5225'
    
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setError('')
      
      // Store auth
      sessionStorage.setItem('admin_auth', 'true')
      sessionStorage.setItem('admin_auth_time', Date.now().toString())
      
      // ✅ CRITICAL: Fetch orders after login
      await fetchOrders()
      
      toast.success('Login successful!')
    } else {
      setError('Incorrect password')
      setTimeout(() => setError(''), 3000)
      toast.error('Login failed')
    }
  }
  
  const handleLogout = () => {
    setIsAuthenticated(false)
    setOrders([])
    sessionStorage.removeItem('admin_auth')
    sessionStorage.removeItem('admin_auth_time')
    setPassword('')
    toast.success('Logged out')
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Manage orders and coupons</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-700">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-green-200">
            <h3 className="text-lg font-semibold text-green-700">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-red-200">
            <h3 className="text-lg font-semibold text-red-700">Rejected</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Orders ({orders.length})</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-mono text-sm" title={order.id}>
                          {order.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{order.email}</div>
                        <div className="text-sm text-gray-500">{order.upi_name}</div>
                      </td>
                      <td className="p-4 font-bold">₹{order.amount}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  const couponCode = prompt('Enter coupon code:', `SHEIN${Math.random().toString(36).substring(2, 10).toUpperCase()}`)
                                  if (couponCode) {
                                    updateOrderStatus(order.id, 'approved', couponCode)
                                  }
                                }}
                                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'rejected')}
                                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.email)
                              toast.success('Email copied!')
                            }}
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="Copy Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert(
                              `Order Details:\n\n` +
                              `ID: ${order.id}\n` +
                              `Email: ${order.email}\n` +
                              `UPI: ${order.upi_name}\n` +
                              `Amount: ₹${order.amount}\n` +
                              `UTR: ${order.utr || 'Not provided'}\n` +
                              `Status: ${order.status}\n` +
                              `Coupon: ${order.coupon_code || 'None'}`
                            )}
                            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Database connected successfully. Showing {orders.length} orders.</p>
          <p className="mt-1">Auto logout in 2 hours</p>
        </div>
      </div>
    </div>
  )
}