"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">Shein Coupons</span>
          </Link>
          
          <div className="flex space-x-6">
            <Link href="/" className="text-white hover:text-pink-200 font-medium transition">
              Home
            </Link>
            <Link href="/track" className="text-white hover:text-pink-200 font-medium transition">
              Track Order
            </Link>
            {/* Admin link removed from public navbar */}
          </div>
        </div>
      </div>
    </nav>
  )
}
