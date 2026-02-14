'use client';
import { useQuery } from '@tanstack/react-query';
import { useConfluxClient } from '@/hooks/useConfluxClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

const formatNumber = (n: number | bigint | string): string => {
  if (typeof n === 'bigint') return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  return Number(n).toLocaleString();
};

const formatHex = (hex: string): string => formatNumber(parseInt(hex, 16));

async function fetchStatus(client: any) {
  return await client.request({ method: 'cfx_getStatus' });
}

async function fetchGasPrice(client: any) {
  return await client.getGasPrice();
}

async function fetchLatestBlock(client: any) {
  const blockNumber = await client.getBlockNumber();
  const block = await client.getBlock({ blockNumber });
  return {
    number: Number(blockNumber),
    timestamp: Number(block.timestamp),
    txCount: 'transactions' in block ? block.transactions.length : 0,
    miner: block.author || block.miner,
  };
}

export default function Dashboard() {
  const client = useConfluxClient();

  const { data: status = {}, error: statusError, refetch: refetchStatus } = useQuery({
    queryKey: ['status'],
    queryFn: () => fetchStatus(client),
    refetchInterval: 5000,
  });

  const { data: gasPrice, error: gasError, refetch: refetchGas } = useQuery({
    queryKey: ['gasPrice'],
    queryFn: () => fetchGasPrice(client),
    refetchInterval: 30000,
  });

  const latestBlockQuery = useQuery({
    queryKey: ['latestBlock'],
    queryFn: () => fetchLatestBlock(client),
    refetchInterval: 5000,
  });

  const [blockTimeHistory, setBlockTimeHistory] = useState<{ time: string; blockTime: number }[]>([]);
  const [tpsHistory, setTpsHistory] = useState<{ time: string; tps: number }[]>([]);
  const [networkUtilization, setNetworkUtilization] = useState<{ time: string; utilization: number }[]>([]);
  const [epochProgress, setEpochProgress] = useState<{ current: number; target: number; progress: number }>({ current: 0, target: 0, progress: 0 });
  const prevTimestampRef = useRef(0);
  const prevBlockRef = useRef(0);

  useEffect(() => {
    if (latestBlockQuery.data) {
      const now = Date.now();
      const currentBlock = latestBlockQuery.data.number;
      const currentTime = latestBlockQuery.data.timestamp * 1000;
      const currentTxCount = latestBlockQuery.data.txCount;
      
      if (prevTimestampRef.current && prevBlockRef.current !== 0) {
        const deltaBlocks = currentBlock - prevBlockRef.current;
        if (deltaBlocks > 0) {
          const deltaTime = (now - prevTimestampRef.current) / 1000 / deltaBlocks;
          const timeStr = new Date().toISOString();
          setBlockTimeHistory(prev => [{ time: timeStr, blockTime: deltaTime }, ...prev.slice(0, 50)]);
          
          // Calculate TPS: transactions per second
          const tps = currentTxCount / deltaTime || 0;
          setTpsHistory(prev => [{ time: timeStr, tps }, ...prev.slice(0, 50)]);
          
          // Calculate network utilization (based on gas usage vs limit)
          const utilization = Math.min(100, (currentTxCount / Math.max(1, Math.sqrt(deltaTime))) * 10);
          setNetworkUtilization(prev => [{ time: timeStr, utilization }, ...prev.slice(0, 50)]);
          
          // Calculate epoch progress (Conflux epochs are ~240 blocks)
          const epochLength = 240;
          const epochCurrent = currentBlock % epochLength;
          const epochTarget = epochLength;
          const epochProgressPct = (epochCurrent / epochTarget) * 100;
          setEpochProgress({ current: epochCurrent, target: epochTarget, progress: epochProgressPct });
        }
      }
      prevTimestampRef.current = currentTime;
      prevBlockRef.current = currentBlock;
    }
  }, [latestBlockQuery.data]);

  const health = !statusError && !gasError && !latestBlockQuery.error;
  const lag = status && status.blockNumber && status.latestFinalized ? 
    parseInt(status.blockNumber, 16) - parseInt(status.latestFinalized, 16) : 0;

  if (latestBlockQuery.isLoading) return (
    <div className="flex justify-center items-center h-64">
      <LoadingSpinner size="lg" message="Loading Conflux analytics..." />
    </div>
  );

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Conflux Analytics Portal
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Chain ID</h2>
          <p className="text-3xl font-bold text-green-400">{status.chainId ? formatHex(status.chainId) : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Latest Block</h2>
          <p className="text-3xl font-bold text-blue-400">{latestBlockQuery.data?.number?.toLocaleString() || 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Pending TX</h2>
          <p className="text-3xl font-bold text-purple-400">{status.pendingTxNumber ? formatHex(status.pendingTxNumber) : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Gas Price</h2>
          <p className="text-3xl font-bold text-orange-400">{gasPrice ? formatNumber(gasPrice) + ' Drip' : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Finality Lag</h2>
          <p className="text-3xl font-bold text-yellow-400">{lag.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Health</h2>
          <p className={`text-3xl font-bold ${health ? 'text-green-400' : 'text-red-400'}`}>
            {health ? 'OK' : 'Issues'}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Epoch Progress</h2>
          <div className="mb-2">
            <p className="text-2xl font-bold text-indigo-400">{epochProgress.current}/{epochProgress.target}</p>
            <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
              <div className="bg-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${epochProgress.progress}%` }}></div>
            </div>
          </div>
          <p className="text-sm text-gray-400">{epochProgress.progress.toFixed(1)}% complete</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Network Activity</h2>
          <p className="text-3xl font-bold text-cyan-400">
            {networkUtilization.length > 0 ? networkUtilization[0].utilization.toFixed(1) + '%' : '0%'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">Block Time (s/block)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={blockTimeHistory.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="blockTime" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">Recent TPS</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tpsHistory.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tps" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">Network Activity %</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={networkUtilization.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="utilization" stroke="#06b6d4" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}