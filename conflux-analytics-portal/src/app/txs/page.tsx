'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useConfluxClient } from '@/hooks/useConfluxClient'

async function fetchRecentTxs(client: any, count: number = 50) {
  const latest = await client.getBlockNumber()
  const txs: any[] = []
  let fetched = 0
  for (let i = 0; i < 20 && fetched < count; i++) { // check last 20 blocks
    const bn = latest - BigInt(i)
    try {
      const blockTxCount = await client.getBlockTransactionCount({ blockNumber: bn })
      const blockTxs = await client.getBlock({ blockNumber: bn })
      const hashes = blockTxs.transactions.slice(0, Math.min(blockTxCount.toNumber(), count - fetched))
      for (const hash of hashes) {
        const tx = await client.getTransaction({ hash: hash as any })
        if (tx) {
          txs.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || 'Contract',
            value: Number(tx.value || 0n),
            blockNumber: Number(bn),
          })
          fetched++
          if (fetched >= count) break
        }
      }
    } catch {}
  }
  return txs.reverse()
}

export default function TxsPage() {
  const client = useConfluxClient()
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const txsQuery = useQuery({
    queryKey: ['txs', page],
    queryFn: () => fetchRecentTxs(client, PAGE_SIZE * (page + 1)),
    keepPreviousData: true,
    refetchInterval: 30000,
  })

  const txs = txsQuery.data?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) || []

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Recent Transactions</h1>
      {txsQuery.isLoading ? (
        <div>Loading...</div>
      ) : txsQuery.isError ? (
        <div className="text-red-500">Error</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b bg-gray-50 text-left">Hash</th>
                  <th className="px-6 py-3 border-b bg-gray-50 text-left">From</th>
                  <th className="px-6 py-3 border-b bg-gray-50 text-left">To</th>
                  <th className="px-6 py-3 border-b bg-gray-50 text-right">Value (CFX)</th>
                  <th className="px-6 py-3 border-b bg-gray-50 text-left">Block</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.hash}>
                    <td className="px-6 py-4 border-b font-mono text-sm">{tx.hash.slice(0,16)}...</td>
                    <td className="px-6 py-4 border-b font-mono text-sm">{tx.from.slice(0,12)}...</td>
                    <td className="px-6 py-4 border-b font-mono text-sm">{tx.to.slice(0,12)}...</td>
                    <td className="px-6 py-4 border-b text-right">{(tx.value / 1e18).toFixed(4)}</td>
                    <td className="px-6 py-4 border-b">{tx.blockNumber.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p-1))} 
              disabled={page === 0 || txsQuery.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {page + 1}</span>
            <button 
              onClick={() => setPage(p => p+1)} 
              disabled={txs.length < PAGE_SIZE || txsQuery.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}