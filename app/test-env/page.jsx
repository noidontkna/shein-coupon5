"use client"

export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Supabase Config:</h2>
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        <p>Base URL: {process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">All env vars in console:</h2>
        <button 
          onClick={() => {
            console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
            console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Missing')
            console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
            alert('Check browser console (F12)')
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Log to Console
        </button>
      </div>
    </div>
  )
}
