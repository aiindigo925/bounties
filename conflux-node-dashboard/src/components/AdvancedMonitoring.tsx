'use client';
import useSWR from 'swr';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getNodeHealth, getSyncProgress, getNetworkInfo } from '@/lib/rpc';
import { useRpc } from '@/contexts/RpcContext';
import { useState, useEffect } from 'react';

interface PerformanceMetric {
  time: string;
  responseTime: number;
  blockHeight: number;
  avgBlockTime: number;
}

export const AdvancedMonitoring = () => {
  const { rpcUrl } = useRpc();
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetric[]>([]);
  
  const { data: nodeHealth, error: healthError } = useSWR(
    [rpcUrl, 'nodeHealth'], 
    () => getNodeHealth(rpcUrl), 
    { refreshInterval: 5000 }
  );
  
  const { data: syncProgress, error: syncError } = useSWR(
    [rpcUrl, 'syncProgress'], 
    () => getSyncProgress(rpcUrl), 
    { refreshInterval: 10000 }
  );
  
  const { data: networkInfo, error: networkError } = useSWR(
    [rpcUrl, 'networkInfo'], 
    () => getNetworkInfo(rpcUrl)
  );

  useEffect(() => {
    if (nodeHealth) {
      const timeStr = new Date().toISOString();
      const blockHeight = parseInt(nodeHealth.blockNumber, 16);
      
      setPerformanceHistory(prev => {
        const newEntry: PerformanceMetric = {
          time: timeStr,
          responseTime: nodeHealth.responseTime,
          blockHeight,
          avgBlockTime: prev.length > 0 ? 
            (Date.now() - new Date(prev[0].time).getTime()) / (blockHeight - prev[0].blockHeight) / 1000 : 0
        };
        return [newEntry, ...prev.slice(0, 100)];
      });
    }
  }, [nodeHealth]);

  const avgResponseTime = performanceHistory.length > 0 ? 
    performanceHistory.reduce((sum, p) => sum + p.responseTime, 0) / performanceHistory.length : 0;

  const isSyncing = syncProgress && typeof syncProgress === 'object';
  const syncPercentage = isSyncing ? 
    ((parseInt(syncProgress.currentBlock, 16) / parseInt(syncProgress.highestBlock, 16)) * 100) : 100;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        Advanced Node Monitoring
      </h2>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Response Time</h3>
          <p className="text-2xl font-bold text-blue-400">
            {nodeHealth ? `${nodeHealth.responseTime}ms` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            Avg: {avgResponseTime ? `${avgResponseTime.toFixed(0)}ms` : 'N/A'}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Sync Status</h3>
          <p className="text-2xl font-bold text-green-400">
            {isSyncing ? `${syncPercentage.toFixed(1)}%` : 'Synced'}
          </p>
          <p className="text-sm text-gray-500">
            {isSyncing ? 'Syncing...' : 'Up to date'}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Network ID</h3>
          <p className="text-2xl font-bold text-purple-400">
            {networkInfo ? networkInfo : 'N/A'}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Node Status</h3>
          <p className={`text-2xl font-bold ${!healthError && !syncError && !networkError ? 'text-green-400' : 'text-red-400'}`}>
            {!healthError && !syncError && !networkError ? 'Healthy' : 'Issues'}
          </p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-gray-200">Response Time History</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceHistory.slice().reverse()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="responseTime" 
              stroke="#3b82f6" 
              fill="url(#responseTimeGradient)" 
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sync Progress Bar */}
      {isSyncing && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-gray-200">Sync Progress</h3>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${syncPercentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Current Block: </span>
              <span className="text-white">{parseInt(syncProgress.currentBlock, 16).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Target Block: </span>
              <span className="text-white">{parseInt(syncProgress.highestBlock, 16).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(healthError || syncError || networkError) && (
        <div className="bg-red-900 border border-red-500 p-4 rounded-xl">
          <h3 className="font-bold text-red-300">Monitoring Errors:</h3>
          {healthError && <p className="text-red-200">Health: {healthError.message}</p>}
          {syncError && <p className="text-red-200">Sync: {syncError.message}</p>}
          {networkError && <p className="text-red-200">Network: {networkError.message}</p>}
        </div>
      )}
    </div>
  );
};