import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Healthcare Portal - Compassionate Care, Seamlessly Booked',
  description: 'Modern healthcare portal for managing appointments, connecting with your care team, and accessing health resources',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

