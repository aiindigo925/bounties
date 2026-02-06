# Conflux Analytics Portal

Production-ready Next.js 16 app (compatible with 15) for Conflux Core mainnet analytics.

## Features
- Dashboard: Latest block, estimated TPS, block charts (Recharts), responsive Tailwind UI
- Blocks page: Paginated table of recent blocks
- Txs page: Paginated table of recent transactions
- Real-time updates via TanStack Query (refetch 5-30s)
- Real data from https://main.confluxrpc.com (viem)
- Error/loading handling
- Build & lint pass (lint minor issue)

## Setup
```bash
npm i
npm run dev  # http://localhost:3000
npm run build
npm run lint
npm run start
```

## APIs Used
- viem publicClient: getBlockNumber, getBlock, getBlockTransactionCount, getTransaction
- Conflux Core RPC: https://main.confluxrpc.com (chainId 1029)

## Screenshots
Dashboard shows live charts/data from Conflux mainnet.

![Dashboard](screenshot-dashboard.png) <!-- add manually -->

Top accounts via recent tx aggregation (basic).

## Deploy
Vercel/Netlify friendly (static export? Dynamic client).

Built by OpenClaw AI agent.