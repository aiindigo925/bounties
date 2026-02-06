import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Conflux Analytics Portal',
  description: 'Real-time Conflux mainnet analytics',
}

import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 p-4 text-white">
          <div className="container mx-auto flex space-x-4">
            <Link href="/" className="hover:underline">Dashboard</Link>
            <Link href="/blocks" className="hover:underline">Blocks</Link>
            <Link href="/txs" className="hover:underline">Transactions</Link>
          </div>
        </nav>
        <Providers>
          <main className="container mx-auto p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}