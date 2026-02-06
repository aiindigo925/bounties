"use client";

import { useState, useEffect, useMemo } from "react";
import { Conflux } from "js-conflux-sdk";
import { MetricCard } from "./MetricCard";
import { NodeSelector } from "./NodeSelector";
import {
  Zap,
  Network,
  Layers,
  Timer,
  CheckCircle,
  AlertTriangle,
  Server,
} from "lucide-react";
import { motion } from "framer-motion";

interface NodeStatus {
  isSyncing: boolean | string;
  peerCount: number;
  blockHeight: number;
  latency: number;
}

export function Dashboard() {
  const [rpcUrl, setRpcUrl] = useState("https://main.confluxrpc.com");
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const conflux = useMemo(() => new Conflux({
    url: rpcUrl,
    networkId: rpcUrl.includes("main") ? 1029 : 1,
  }), [rpcUrl]);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        const startTime = Date.now();
        const isSyncing = await conflux.cfx.isSyncing();
        const latency = Date.now() - startTime;

        const peerCount = await conflux.cfx.getPeerCount();
        const blockHeight = await conflux.cfx.epochNumber();

        setStatus({
          isSyncing: isSyncing,
          peerCount: Number(peerCount),
          blockHeight: Number(blockHeight),
          latency,
        });
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred");
        }
        console.error(err);
        setStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [conflux]);

  const getSyncStatus = () => {
    if (status?.isSyncing === false) {
      return {
        value: "Synchronized",
        icon: <CheckCircle className="h-8 w-8 text-green-400" />,
        isWarning: false,
      };
    }
    if (typeof status?.isSyncing === 'object' && status.isSyncing !== null) {
      return {
        value: "Syncing...",
        icon: <AlertTriangle className="h-8 w-8 text-yellow-400" />,
        isWarning: true,
      };
    }
    return {
      value: "Unknown",
      icon: <AlertTriangle className="h-8 w-8 text-gray-500" />,
      isWarning: true,
    };
  };

  const syncStatus = getSyncStatus();
  
  const connectionStatus = error ? (
    <div className="flex items-center text-red-400">
      <Server className="h-5 w-5 mr-2" />
      <span>Connection Error</span>
    </div>
  ) : (
    <div className="flex items-center text-green-400">
      <Server className="h-5 w-5 mr-2" />
      <span>Connected</span>
    </div>
  );

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-white mb-4 md:mb-0"
        >
          Conflux Node Dashboard
        </motion.h1>
        <div className="flex items-center space-x-4">
            {connectionStatus}
            <NodeSelector onSelect={setRpcUrl} selectedUrl={rpcUrl} />
        </div>
      </div>

      {error && !isLoading && (
        <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg mb-8">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800/50 p-6 rounded-lg shadow-lg animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-700 rounded w-3/4"></div>
                </div>
            ))}
        </div>
      ) : status && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <MetricCard
            label="Status"
            value={syncStatus.value}
            icon={syncStatus.icon}
            isWarning={syncStatus.isWarning}
          />
          <MetricCard
            label="Peer Count"
            value={status.peerCount}
            icon={<Network className="h-8 w-8 text-blue-400" />}
          />
          <MetricCard
            label="Block Height"
            value={status.blockHeight}
            icon={<Layers className="h-8 w-8 text-purple-400" />}
          />
          <MetricCard
            label="Latency"
            value={`${status.latency} ms`}
            icon={<Timer className="h-8 w-8 text-indigo-400" />}
            isWarning={status.latency > 500}
          />
        </motion.div>
      )}
    </div>
  );
}
