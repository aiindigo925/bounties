// enhanced version later, but to save, let's summarize

'use client';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStatus, getGasPrice, getPeersCount, getClientVersion } from '@/lib/rpc';
import { useRpc } from '@/contexts/RpcContext';
import { useState, useEffect, useRef } from 'react';

const formatHex = (hex: string) => parseInt(hex, 16).toLocaleString();

const Overview = () => {
  const { rpcUrl } = useRpc();
  const { data: status, error: statusError, isLoading: statusLoading } = useSWR([rpcUrl, 'status'], ([ , ] ) => getStatus(rpcUrl));
  const { data: gasPrice, error: gasError, isLoading: gasLoading } = useSWR([rpcUrl, 'gas'], () => getGasPrice(rpcUrl));
  const { data: peers, error: peersError, isLoading: peersLoading } = useSWR([rpcUrl, 'peers'], () => getPeersCount(rpcUrl));
  const { data: clientVersion, error: clientError } = useSWR([rpcUrl, 'client'], () => getClientVersion(rpcUrl));

  const [blockTimeHistory, setBlockTimeHistory] = useState<{ time: string; blockTime: number }>([]); 
  const [gasHistory, setGasHistory] = useState<{ time: string; gas: number }>([]);
  const [pendingHistory, setPendingHistory] = useState<{ time: string; pending: number }>([]);
  const [lagHistory, setLagHistory] = useState<{ time: string; lag: number }>([]);

  const prevBlockRef = useRef('');
  const prevTimeRef = useRef(0);

  useEffect(() => {
    if (status) {
      const now = Date.now();
      const blockNum = parseInt(status.blockNumber, 16);
      const prevBlockNum = parseInt(prevBlockRef.current, 16);
      if (prevBlockRef.current &amp;&amp; prevTimeRef.current &amp;&amp; blockNum > prevBlockNum) {
        const deltaBlocks = blockNum - prevBlockNum;
        const deltaTime = (now - prevTimeRef.current) / 1000 / deltaBlocks;
        const timeStr = new Date().toISOString();
        setBlockTimeHistory(prev => [{ time: timeStr, blockTime: deltaTime }, ...prev.slice(0, 50)]);
      }
      prevBlockRef.current = status.blockNumber;
      prevTimeRef.current = now;

      // pending
      const timeStr = new Date().toISOString();
      const pending = parseInt(status.pendingTxNumber, 16);
      setPendingHistory(prev => [{ time: timeStr, pending }, ...prev.slice(0, 50)]);

      // lag
      const lag = parseInt(status.blockNumber, 16) - parseInt(status.latestFinalized || '0x0', 16);
      setLagHistory(prev => [{ time: timeStr, lag }, ...prev.slice(0, 50)]);
    }
  }, [status]);

  useEffect(() => {
    if (gasPrice) {
      const timeStr = new Date().toISOString();
      const gas = parseInt(gasPrice, 16);
      setGasHistory(prev => [{ time: timeStr, gas }, ...prev.slice(0, 50)]);
    }
  }, [gasPrice]);

  const avgBlockTime = blockTimeHistory.length > 0 ? blockTimeHistory.reduce((sum, b) => sum + b.blockTime, 0) / blockTimeHistory.length : 0;

  const health = !statusError &amp;&amp; !gasError &amp;&amp; !peersError;

  if (statusLoading || gasLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Conflux Node Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Chain ID</h2>
          <p className="text-3xl font-bold text-green-400">{status ? formatHex(status.chainId) : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Best Block</h2>
          <p className="text-3xl font-bold text-blue-400">{status ? formatHex(status.blockNumber) : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Pending TX</h2>
          <p className="text-3xl font-bold text-purple-400">{status ? formatHex(status.pendingTxNumber) : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Gas Price</h2>
          <p className="text-3xl font-bold text-orange-400">{gasPrice ? formatHex(gasPrice) + ' Drip' : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Peers</h2>
          <p className="text-3xl font-bold text-indigo-400">{peers !== undefined ? peers.toString() : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Avg Block Time</h2>
          <p className="text-3xl font-bold text-emerald-400">{avgBlockTime ? avgBlockTime.toFixed(1) + 's' : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Sync Lag</h2>
          <p className="text-3xl font-bold text-yellow-400">{status ? (parseInt(status.blockNumber, 16) - parseInt(status.latestFinalized || '0x0', 16)).toLocaleString() : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Client Version</h2>
          <p className="text-xl font-mono">{clientVersion || 'N/A'}</p>
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
          <h2 className="text-2xl font-bold mb-4">Gas Price Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gasHistory.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="gas" stroke="#f59e0b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Sync Lag</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lagHistory.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="lag" stroke="#eab308" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl lg:col-span-2">
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
      {statusError &amp;&amp; <div className="mt-8 p-4 bg-red-900 border border-red-500 rounded-xl"><h3 className="font-bold">Status Error:</h3><p>{statusError.message}</p></div>}
      {gasError &amp;&amp; <div className="mt-8 p-4 bg-red-900 border border-red-500 rounded-xl"><h3 className="font-bold">Gas Error:</h3><p>{gasError.message}</p></div>}
      {peersError &amp;&amp; <div className="mt-8 p-4 bg-red-900 border border-red-500 rounded-xl"><h3 className="font-bold">Peers Error:</h3><p>{peersError.message}</p></div>}
    </div>
  );
};

export default Overview;