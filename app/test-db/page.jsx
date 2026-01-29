"use client"

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function TestDB() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (error) {
          console.error('Supabase error:', error)
          return
        }
        
        setOrders(data || [])
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6"> Supabase Connected Successfully!</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-2">Database Status</h2>
          <p className="text-green-700">
            Connected to: <code className="bg-green-100 px-2 py-1 rounded">pdxonykfylkgnxnxrgmd.supabase.co</code>
          </p>
          <p className="text-green-700 mt-2">
            Found <span className="font-bold">{orders.length}</span> orders in database
          </p>
        </div>
        
        {loading ? (
          <div className="bg-blue-50 p-6 rounded-xl">
            <p className="text-blue-700">Loading orders...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-700">Orders from Supabase</h3>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{order.utr}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'approved' ? 'bg-green-100 text-green-800' :
                        order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No orders found. Try creating one from the buy page.
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 flex justify-between">
          <a href="/" className="text-purple-600 hover:underline"> Back to Home</a>
          <div className="space-x-4">
            <a href="/buy/500" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Test Buy Page 
            </a>
            <a href="/track" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Test Track Page 
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
