'use client';
import Link from 'next/link';
import { useRpc } from '../contexts/RpcContext';

export default function Nav() {
  const { rpcUrl, setRpcUrl } = useRpc();

  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
        <Link href="/" className="text-2xl font-bold text-blue-400">
          Conflux Node Dashboard
        </Link>
        <div className="flex gap-4 items-center flex-wrap">
          <Link href="/" className="hover:text-blue-400 transition">Overview</Link>
          <Link href="/peers" className="hover:text-blue-400 transition">Peers</Link>
          <Link href="/blocks" className="hover:text-blue-400 transition">Blocks</Link>
          <div className="flex gap-2">
            <input 
              type="url" 
              className="bg-gray-700 text-white p-2 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="http://localhost:12537"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
            />
            <button 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              onClick={() => window.location.reload()}
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}