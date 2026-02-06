'use client';
import useSWR from 'swr';
import { getStatus } from '@/lib/rpc';

const formatHex = (hex: string) => parseInt(hex, 16).toLocaleString();

const BlocksPage = () => {
  const { data: status } = useSWR('status', getStatus);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        Recent Blocks
      </h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
        <p className="text-xl">Recent blocks list not available on public RPC.</p>
        <p className="text-gray-400 mt-4">Latest Best Block: #{status ? formatHex(status.blockNumber) : 'Loading...'}</p>
        <p className="text-gray-400">Best Hash: <span className="font-mono break-all">{status?.bestHash || 'Loading...'}</span></p>
      </div>
    </div>
  );
};

export default BlocksPage;