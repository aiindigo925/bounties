import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Nav from '../components/Nav';
import { RpcProvider } from '../contexts/RpcContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Conflux Node Dashboard',
  description: 'Real-time dashboard for monitoring your Conflux node.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-900 text-white`}>
        <RpcProvider>
          <Nav />
          <main className="max-w-7xl mx-auto p-6">
            {children}
          </main>
        </RpcProvider>
      </body>
    </html>
  );
}