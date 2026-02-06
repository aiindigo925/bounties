import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Conflux Node Dashboard',
  description: 'Monitor your Conflux node with real-time data.',
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
              Conflux Dashboard
            </Link>
            <div className="space-x-4">
              <Link href="/" className="hover:text-blue-400 transition">Overview</Link>
              <Link href="/peers" className="hover:text-blue-400 transition">Peers</Link>
              <Link href="/blocks" className="hover:text-blue-400 transition">Blocks</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}