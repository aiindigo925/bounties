# Conflux Node Dashboard

A modern, real-time dashboard for monitoring your Conflux full node.

![Overview](screenshots/overview.png)

## Features

- **Live Metrics**: Chain ID, best block, pending TXs, gas price, peer count, avg block time, sync lag, client version
- **Interactive Charts**: Gas trends, sync progress (lag), block time, peers over time
- **Recent Blocks Table**: Responsive table with latest 20 blocks (number, age, tx count, miner, hash)
- **Custom RPC**: Connect to local node or any Conflux RPC endpoint via UI
- **Error Handling & Loading States**: Spinners, error banners, health status
- **Responsive Design**: Mobile-friendly grids, scrollable tables
- **Auto-refresh**: SWR-powered data fetching with intervals

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Viem (RPC client ready)
- SWR (data fetching)
- Recharts (charts)
- Tailwind CSS (styling)
- Jest (testing)

## Quick Setup

1. Clone the repo
```
git clone &lt;repo&gt;
cd conflux-node-dashboard
```

2. Install dependencies
```
npm install
```

3. Run development server
```
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

5. Enter your Conflux node RPC URL (default: http://localhost:12537) and click Connect

## Screenshots

![Overview Cards & Charts](screenshots/overview.png)
![Peers Chart](screenshots/peers.png)
![Recent Blocks Table](screenshots/blocks.png)

## Build & Test

```
npm run build  # Optimized production build
npm test       # Run tests
npm start      # Production server
```

## RPC Methods Used

- `cfx_getStatus`
- `cfx_gasPrice`
- `net_peerCount`
- `cfx_getClientVersion`
- `cfx_blockNumber`
- `cfx_getBlockByNumber`

Connect to your local Conflux node for full metrics (peers, blocks).

## License

MIT