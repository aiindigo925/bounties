'use client'

import { useQuery } from '@tanstack/react-query'
import { useConfluxClient } from '@/hooks/useConfluxClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

async function fetchLatestBlock(client: any) {
  const blockNumber = await client.getBlockNumber()
  const block = await client.getBlock({
    blockNumber: blockNumber,
  })
  return {
    number: Number(blockNumber),
    timestamp: Number(block.timestamp),
    txCount: 'transactions' in block ? block.transactions.length : 0,
    miner: block.author || block.miner,
  }
}

async function fetchTPSHistory(client: any) {
  const latest = await client.getBlockNumber()
  const history: any[] = []
  for (let i = 0; i < 12; i++) { // last ~6s *12 =1min ?
    const bn = latest - BigInt(i * 100) // every 100 blocks ~50s
    try {
      const block = await client.getBlock({ blockNumber: bn })
      history.push({
        time: Number(block.timestamp),
        tps: ('transactions' in block ? block.transactions.length : 0) / 50 // assume 50s
      })
    } catch {}
  }
  return history.reverse()
}

export default function Dashboard() {
  const client = useConfluxClient()

  const latestBlockQuery = useQuery({
    queryKey: ['latestBlock'],
    queryFn: () => fetchLatestBlock(client),
    refetchInterval: 5000,
  })

  const tpsHistoryQuery = useQuery({
    queryKey: ['tpsHistory'],
    queryFn: () => fetchTPSHistory(client),
    refetchInterval: 30000,
  })

  const estimatedTPS = latestBlockQuery.data?.txCount / 0.5 || 0 // assume 0.5s block time

  if (latestBlockQuery.isLoading || tpsHistoryQuery.isLoading) return <div className="flex justify-center items-center h-64"><div>Loading...</div></div>
  if (latestBlockQuery.isError) return <div className="text-red-500">Error loading data</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Conflux Mainnet Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Latest Block</h2>
          <p className="text-2xl">{latestBlockQuery.data?.number?.toLocaleString()}</p>
          <p className="text-gray-600">Txs: {latestBlockQuery.data?.txCount}</p>
          <p className="text-gray-600">Miner: {latestBlockQuery.data?.miner?.slice(0,10)}...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Est. TPS</h2>
          <p className="text-3xl">{estimatedTPS.toFixed(0)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Block Time</h2>
          <p className="text-2xl">{(Date.now() / 1000 - latestBlockQuery.data?.timestamp || 0).toFixed(0)}s ago</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">TPS Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={tpsHistoryQuery.data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tickFormatter={(t) => new Date(t * 1000).toLocaleTimeString()} />
            <YAxis />
            <Tooltip formatter={(v) => [v, 'TPS']} labelFormatter={(t) => new Date(t * 1000).toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="tps" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}