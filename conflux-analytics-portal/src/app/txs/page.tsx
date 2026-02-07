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
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Recent Transactions
      </h1>
      {txsQuery.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-400">Loading transactions...</div>
        </div>
      ) : txsQuery.isError ? (
        <div className="text-red-400 text-center text-xl">Error loading transactions</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow-xl">
            <table className="min-w-full divide-y divide-gray-700 bg-gray-900">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Value (CFX)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {txs.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                      {tx.hash.slice(0,16)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                      {tx.from.slice(0,12)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                      {tx.to.slice(0,12)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-400 font-mono">
                      {(tx.value / 1e18).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {tx.blockNumber.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-6 space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p-1))} 
              disabled={page === 0 || txsQuery.isLoading}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <span className="px-4 py-2 text-gray-300">Page {page + 1}</span>
            <button 
              onClick={() => setPage(p => p+1)} 
              disabled={txs.length < PAGE_SIZE || txsQuery.isLoading}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}