import Link from "next/link"

export default function Home() {
  const packages = [
    { amount: 50, discount: 500 },
    { amount: 100, discount: 1000 },
    { amount: 200, discount: 2000 },
    { amount: 500, discount: 5000 }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Exclusive Shein Coupon Codes</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get massive discounts on your Shein purchases with our exclusive coupon codes
          </p>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Choose Your Discount Package
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.amount} className="bg-white rounded-2xl shadow-xl p-8 transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-2xl font-bold py-2 px-6 rounded-full mb-4">
                  ₹{pkg.discount}
                </div>
                <h3 className="text-3xl font-bold text-gray-800">
                  ₹{pkg.discount} OFF
                </h3>
                <p className="text-gray-600 mt-2">
                  Get ₹{pkg.discount} off on SHEIN WEBSITE
                </p>
              </div>
              
              <Link 
                href={`/buy/${pkg.amount}`}
                className="block w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all text-center"
              >
                Buy Now - ₹{pkg.amount}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
