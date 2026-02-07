\'use client\';
import useSWR from \'swr\';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from \'recharts\';
import { getPeersCount } from \'@/lib/rpc\';
import { useRpc } from \'@/contexts/RpcContext\';
import { useState, useEffect } from \'react\';

const PeersPage = () => {
  const { rpcUrl } = useRpc();
  const { data: peers, error, isLoading } = useSWR([rpcUrl, \'peers\'], () => getPeersCount(rpcUrl));
  const [peersHistory, setPeersHistory] = useState<{ time: string; peers: number }>([]);

  useEffect(() => {
    if (peers !== undefined) {
      const timeStr = new Date().toISOString();
      setPeersHistory(prev => [{ time: timeStr, peers }, ...prev.slice(0, 50)]);
    }
  }, [peers]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Network Peers
      </h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl mb-6">
        <h2 className="text-2xl font-bold mb-4">Current Peers</h2>
        <p className="text-5xl font-bold text-indigo-400">{peers || 0}</p>
        {error &amp;&amp; <p className="text-red-400 mt-4">Error: {error.message}</p>}
      </div>
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Peers Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={peersHistory.slice().reverse()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="peers" stroke="#a78bfa" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PeersPage;