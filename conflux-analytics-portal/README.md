# Conflux Analytics Portal

Production-ready Next.js analytics dashboard for Conflux Core mainnet with real-time monitoring.

## Features
- **Dashboard**: Live metrics (Chain ID, latest block, pending TX, gas price, finality lag)
- **Real-time TPS**: Calculated from actual transaction throughput and block times
- **Block Time Charts**: Historical block timing with live updates
- **Blocks Explorer**: Paginated table of recent blocks with transaction counts
- **Transaction Explorer**: Paginated transaction history with CFX values
- **Responsive UI**: Dark theme Tailwind CSS with gradient accents
- **Live Updates**: 5-30s refresh intervals via TanStack Query
- **Error Handling**: Comprehensive error states and loading indicators
- **Health Monitoring**: Network health status based on RPC connectivity

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