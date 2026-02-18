'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface HistoricalDataPoint {
  timestamp: number;
  blockNumber: number;
  txCount: number;
  gasUsed: string;
  difficulty: string;
  size: number;
}

interface Props {
  data: HistoricalDataPoint[];
}

export default function HistoricalData({ data }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<'txCount' | 'gasUsed' | 'blockSize'>('txCount');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h');

  const formatData = (rawData: HistoricalDataPoint[]) => {
    const now = Date.now();
    const rangeMs = timeRange === '1h' ? 3600000 : timeRange === '6h' ? 21600000 : 86400000;
    const cutoff = now - rangeMs;
    
    return rawData
      .filter(d => d.timestamp * 1000 > cutoff)
      .map(d => ({
        time: new Date(d.timestamp * 1000).toLocaleTimeString(),
        txCount: d.txCount,
        gasUsed: parseInt(d.gasUsed, 16) / 1e9, // Convert to Ggas
        blockSize: d.size / 1024, // Convert to KB
        blockNumber: d.blockNumber
      }))
      .slice(-50); // Keep last 50 points
  };

  const chartData = formatData(data);

  const getMetricConfig = () => {
    switch (selectedMetric) {
      case 'txCount':
        return { key: 'txCount', name: 'Transaction Count', color: '#8b5cf6', unit: '' };
      case 'gasUsed':
        return { key: 'gasUsed', name: 'Gas Used (Ggas)', color: '#f59e0b', unit: ' Ggas' };
      case 'blockSize':
        return { key: 'blockSize', name: 'Block Size (KB)', color: '#10b981', unit: ' KB' };
    }
  };

  const config = getMetricConfig();

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-200">Historical Analytics</h2>
        <div className="flex gap-2">
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="bg-gray-700 text-white rounded px-3 py-1"
          >
            <option value="txCount">Transactions</option>
            <option value="gasUsed">Gas Usage</option>
            <option value="blockSize">Block Size</option>
          </select>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-700 text-white rounded px-3 py-1"
          >
            <option value="1h">1 Hour</option>
            <option value="6h">6 Hours</option>
            <option value="24h">24 Hours</option>
          </select>
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => [`${Number(value).toFixed(2)}${config.unit}`, config.name]}
            />
            <Area 
              type="monotone" 
              dataKey={config.key} 
              stroke={config.color} 
              strokeWidth={2}
              fill={config.color}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-400">
          Collecting historical data...
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-1">Avg TX/Block</h3>
          <p className="text-2xl font-bold text-purple-400">
            {chartData.length > 0 ? 
              (chartData.reduce((sum, d) => sum + d.txCount, 0) / chartData.length).toFixed(1) : 
              '0'
            }
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-1">Peak Gas (Ggas)</h3>
          <p className="text-2xl font-bold text-orange-400">
            {chartData.length > 0 ? 
              Math.max(...chartData.map(d => d.gasUsed)).toFixed(2) : 
              '0'
            }
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-1">Max Block Size (KB)</h3>
          <p className="text-2xl font-bold text-green-400">
            {chartData.length > 0 ? 
              Math.max(...chartData.map(d => d.blockSize)).toFixed(1) : 
              '0'
            }
          </p>
        </div>
      </div>
    </div>
  );
}