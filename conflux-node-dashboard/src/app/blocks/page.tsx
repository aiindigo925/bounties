'use client';
import { useState, useEffect } from 'react';
import { getBlockNumber, callRpc } from '@/lib/rpc';
import { useRpc } from '@/contexts/RpcContext';

const formatHex = (hex: string) => parseInt(hex, 16).toLocaleString();
const formatTimestamp = (timestampHex: string) => {
  const ts = parseInt(timestampHex, 16) * 1000;
  const now = Date.now();
  const age = Math.floor((now - ts) / 1000);
  if (age < 60) return `${age}s ago`;
  if (age < 3600) return `${Math.floor(age/60)}m ago`;
  return new Date(ts).toLocaleString();
};

const BlocksPage = () => {
  const { rpcUrl } = useRpc();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setLoading(true);
        const bnHex = await getBlockNumber(rpcUrl);
        const bn = parseInt(bnHex, 16);
        const recent = [];
        for (let i = 0; i < 20; i++) {
          const blockHex = `0x${(bn - i).toString(16)}`;
          const block = await callRpc(rpcUrl, 'cfx_getBlockByNumber', [blockHex, false]);
          recent.push(block);
        }
        setBlocks(recent);
        setError('');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 10000);
    return () => clearInterval(interval);
  }, [rpcUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        Recent Blocks
      </h1>
      <div className="overflow-x-auto rounded-xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-700 bg-gray-900">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Block</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tx Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Miner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {blocks.map((block, index) => (
              <tr key={index} className="hover:bg-gray-800 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                  {formatHex(block.blockNumber)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {block.transactions?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatTimestamp(block.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                  {block.miner?.slice(0, 12)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlocksPage;