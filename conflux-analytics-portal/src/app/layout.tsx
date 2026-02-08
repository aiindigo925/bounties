import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Conflux Analytics Portal',
  description: 'Real-time Conflux mainnet analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-900 text-white`}>
        <nav className="bg-gray-800 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-400">
              Conflux Analytics
            </Link>
            <div className="space-x-4">
              <Link href="/" className="hover:text-blue-400 transition">Dashboard</Link>
              <Link href="/blocks" className="hover:text-blue-400 transition">Blocks</Link>
              <Link href="/txs" className="hover:text-blue-400 transition">Txs</Link>
            </div>
          </div>
        </nav>
        <Providers>
          <main className="max-w-7xl mx-auto p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}