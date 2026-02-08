'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPeersCount } from '@/lib/rpc';
import { useRpc } from '@/contexts/RpcContext';

const PeersPage = () => {
  const { rpcUrl } = useRpc();
  const { data: peers, error, isLoading } = useSWR([rpcUrl, 'peers'], () => getPeersCount(rpcUrl));
  const [peersHistory, setPeersHistory] = useState<{ time: string; peers: number }[]>([]);

  useEffect(() => {
    if (peers !== undefined) {
      const timeStr = new Date().toISOString();
      const peerCount = parseInt(peers, 16);
      setPeersHistory(prev => [
        { time: timeStr, peers: peerCount },
        ...prev.slice(0, 49)
      ]);
    }
  }, [peers]);

  if (error) {
    return (
      <div className="bg-red-900 p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Network Peers
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Current Peers</h2>
          <p className="text-5xl font-bold text-center text-purple-400">
            {isLoading ? 'Loading...' : peers !== undefined ? parseInt(peers, 16) : 'N/A'}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Peer Count History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={peersHistory.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="peers" stroke="#a78bfa" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PeersPage;