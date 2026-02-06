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
      const block = await Promise.all([
        client.getBlock({ blockNumber: bn }),
        client.getBlockTransactionCount({ blockNumber: bn })
      ])
      blocks.push({
        number: Number(bn),
        txCount: Number(block[1]),
        timestamp: Number(block[0].timestamp),
        miner: block[0].author || block[0].miner,
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
      <h1 className="text-3xl font-bold mb-8">Recent Blocks</h1>
      {blocksQuery.isLoading ? (
        <div>Loading...</div>
      ) : blocksQuery.isError ? (
        <div className="text-red-500">Error</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b bg-gray-50 text-left">Block #</th>
                  <th className="px-6 py-3 border-b bg-gray-50 text-left">Tx Count</th>
                  <th className="px-6 py-3 border-b bg-gray-50 text-left">Timestamp</th>
                  <th className="px-6 py-3 border-b bg-gray-50 text-left">Miner</th>
                </tr>
              </thead>
              <tbody>
                {blocksQuery.data?.map((block) => (
                  <tr key={block.number}>
                    <td className="px-6 py-4 border-b">{block.number.toLocaleString()}</td>
                    <td className="px-6 py-4 border-b">{block.txCount}</td>
                    <td className="px-6 py-4 border-b">{new Date(block.timestamp * 1000).toLocaleString()}</td>
                    <td className="px-6 py-4 border-b">{(block.miner || '').slice(0,12)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p-1))} 
              disabled={page === 0 || blocksQuery.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {page + 1}</span>
            <button 
              onClick={() => setPage(p => p+1)} 
              disabled={blocksQuery.isLoading}
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