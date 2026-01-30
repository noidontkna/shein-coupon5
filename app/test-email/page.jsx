"use client"
import { sendTestEmail } from '@/app/actions/email-actions'
import { useState } from 'react'

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleTest = async () => {
    setLoading(true)
    const response = await sendTestEmail()
    
    if (response.success) {
      setResult(`✅ Email sent successfully! ID: ${response.messageId}`)
    } else {
      setResult(`❌ Failed: ${response.error}`)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Email System</h1>
      <button 
        onClick={handleTest}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Sending Test Email...' : 'Send Test Email to Yourself'}
      </button>
      
      {result && (
        <div className={`mt-4 p-4 rounded ${result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result}
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-600">
        <p><strong>Note:</strong> This will send an email to: <code>shein.coupons.service@gmail.com</code></p>
        <p>Check both inbox and spam folder.</p>
      </div>
    </div>
  )
}