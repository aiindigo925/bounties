'use client';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStatus, getGasPrice } from '@/lib/rpc';
import { useState, useEffect, useRef } from 'react';

const formatHex = (hex: string) => parseInt(hex, 16).toLocaleString();

const Overview = () => {
  const { data: status, error: statusError, mutate: mutateStatus } = useSWR('status', getStatus, { refreshInterval: 5000 });
  const { data: gasPrice, error: gasError } = useSWR('gas', getGasPrice, { refreshInterval: 30000 });

  const [blockTimeHistory, setBlockTimeHistory] = useState<{ time: string; blockTime: number }[]>([]);
  const prevBlockRef = useRef('');
  const prevTimeRef = useRef(0);

  useEffect(() => {
    if (status) {
      const now = Date.now();
      const blockNum = parseInt(status.blockNumber, 16);
      const prevBlockNum = parseInt(prevBlockRef.current, 16);
      if (prevBlockRef.current && prevTimeRef.current) {
        const deltaBlocks = blockNum - prevBlockNum;
        if (deltaBlocks > 0) {
          const deltaTime = (now - prevTimeRef.current) / 1000 / deltaBlocks;
          const timeStr = new Date().toISOString();
          setBlockTimeHistory(prev => [{ time: timeStr, blockTime: deltaTime }, ...prev.slice(0, 50)]);
        }
      }
      prevBlockRef.current = status.blockNumber;
      prevTimeRef.current = now;
    }
  }, [status]);

  const pendingHistory = useState<{ time: string; pending: number }[]>([]);

  const health = !statusError && !gasError;

  const lag = status ? parseInt(status.blockNumber, 16) - parseInt(status.latestFinalized, 16) : 0;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Conflux Node Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Chain ID</h2>
          <p className="text-3xl font-bold text-green-400">{status ? formatHex(status.chainId) : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Best Block</h2>
          <p className="text-3xl font-bold text-blue-400">{status ? formatHex(status.blockNumber) : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Pending TX</h2>
          <p className="text-3xl font-bold text-purple-400">{status ? formatHex(status.pendingTxNumber) : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Gas Price</h2>
          <p className="text-3xl font-bold text-orange-400">{gasPrice ? formatHex(gasPrice) + ' Drip' : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Sync Lag</h2>
          <p className="text-3xl font-bold text-yellow-400">{status ? lag.toLocaleString() : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Health</h2>
          <p className={`text-3xl font-bold ${health ? 'text-green-400' : 'text-red-400'}`}>
            {health ? 'OK' : 'Issues'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Pending TX Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[]} >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pending" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Block Time (s)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={blockTimeHistory.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="blockTime" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;