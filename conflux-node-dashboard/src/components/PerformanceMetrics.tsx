'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Metric {
  timestamp: number;
  responseTime: number;
  memoryUsage: number;
  cpuLoad: number;
}

interface PerformanceMetricsProps {
  responseTime?: number;
}

export default function PerformanceMetrics({ responseTime = 0 }: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    if (responseTime > 0) {
      const now = Date.now();
      const newMetric: Metric = {
        timestamp: now,
        responseTime,
        memoryUsage: Math.random() * 100, // Mock data - in real app would come from node
        cpuLoad: Math.random() * 100, // Mock data - in real app would come from node
      };
      
      setMetrics(prev => [newMetric, ...prev.slice(0, 59)]); // Keep last 60 points
    }
  }, [responseTime]);

  const averageResponseTime = metrics.length > 0 ? 
    metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length : 0;

  const maxResponseTime = metrics.length > 0 ? 
    Math.max(...metrics.map(m => m.responseTime)) : 0;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-200">Performance Metrics</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl">
          <h4 className="text-sm font-medium text-gray-400">Current Response</h4>
          <p className="text-2xl font-bold text-blue-400">{responseTime}ms</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-xl">
          <h4 className="text-sm font-medium text-gray-400">Average Response</h4>
          <p className="text-2xl font-bold text-green-400">
            {averageResponseTime.toFixed(0)}ms
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-xl">
          <h4 className="text-sm font-medium text-gray-400">Peak Response</h4>
          <p className="text-2xl font-bold text-orange-400">{maxResponseTime}ms</p>
        </div>
      </div>

      {/* Response Time Chart */}
      {metrics.length > 5 && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <h4 className="text-lg font-semibold mb-4 text-gray-200">Response Time History</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[...metrics].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(ts) => new Date(ts as number).toLocaleString()}
                formatter={(value: number) => [`${value}ms`, 'Response Time']}
              />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Health Status */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h4 className="text-lg font-semibold mb-2 text-gray-200">Connection Health</h4>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            responseTime < 100 ? 'bg-green-500' : 
            responseTime < 500 ? 'bg-yellow-500' : 'bg-red-500'
          } ${responseTime > 0 ? 'animate-pulse' : ''}`} />
          <span className={`font-medium ${
            responseTime < 100 ? 'text-green-400' : 
            responseTime < 500 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {responseTime === 0 ? 'Not Connected' :
             responseTime < 100 ? 'Excellent' :
             responseTime < 500 ? 'Good' : 'Slow'}
          </span>
          {responseTime > 0 && (
            <span className="text-gray-400 text-sm">
              ({metrics.length} samples)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}