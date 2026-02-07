'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useConfluxClient } from '@/hooks/useConfluxClient'

async function fetchBlocks(client: any, startBlock: bigint, count: number) {
  const latest = await client.getBlockNumber()
  const endBlock = latest - startBlock + 1n || 0n
  const blocks: any[] = []
  for (let i = 0; i < count; i++) {
    const bn = latest - BigInt(i)
    try {
      const [block, txCount] = await Promise.all([
        client.getBlock({ blockNumber: bn }),
        client.getBlockTransactionCount({ blockNumber: bn })
      ])
      blocks.push({
        number: Number(bn),
        txCount: Number(txCount),
        timestamp: Number(block.timestamp),
        miner: block.author || block.miner,
      })
    } catch (e) {}
  }
  return blocks.reverse()
}

export default function BlocksPage() {
  const client = useConfluxClient()
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const blocksQuery = useQuery({
    queryKey: ['blocks', page],
    queryFn: () => fetchBlocks(client, BigInt(page * PAGE_SIZE), PAGE_SIZE),
    keepPreviousData: true,
  })

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Recent Blocks
      </h1>
      {blocksQuery.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-400">Loading blocks...</div>
        </div>
      ) : blocksQuery.isError ? (
        <div className="text-red-400 text-center text-xl">Error loading blocks</div>
      ) : (
        <>
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
                {blocksQuery.data?.map((block) => (
                  <tr key={block.number} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                      {block.number.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {block.txCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(block.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {(block.miner || '').slice(0,12)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-6 space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p-1))} 
              disabled={page === 0 || blocksQuery.isLoading}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <span className="px-4 py-2 text-gray-300">Page {page + 1}</span>
            <button 
              onClick={() => setPage(p => p+1)} 
              disabled={blocksQuery.isLoading}
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