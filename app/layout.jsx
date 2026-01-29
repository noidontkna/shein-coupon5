import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "../components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Shein Coupon Codes - Get Exclusive Discounts",
  description: "Buy exclusive Shein coupon codes at amazing discounts",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-8 text-center">
          <p>© 2024 Shein Coupon Codes. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}
