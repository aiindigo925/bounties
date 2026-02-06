'use client'

import { createPublicClient, http, type PublicClient } from 'viem'

const CONFLUX_RPC = 'https://main.confluxrpc.com'

const chain = {
  id: 1029,
  name: 'Conflux Core',
  nativeCurrency: {
    decimals: 18,
    name: 'Conflux',
    symbol: 'CFX',
  },
  rpcUrls: {
    default: { http: [CONFLUX_RPC] },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan', url: 'https://confluxscan.io' },
  },
} as const

export function useConfluxClient(): PublicClient {
  return createPublicClient({
    chain,
    transport: http(),
  })
}