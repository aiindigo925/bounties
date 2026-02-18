'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface NodeMetrics {
  blockHeight?: number;
  pendingTxs?: number;
  peers?: number;
  syncLag?: number;
  gasPrice?: number;
  responseTime?: number;
  isHealthy?: boolean;
}

interface Props {
  metrics: NodeMetrics;
}

export default function AlertSystem({ metrics }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState({
    maxSyncLag: 10,
    minPeers: 5,
    maxResponseTime: 5000,
    maxPendingTxs: 1000,
    maxGasPrice: 1000000000000 // 1000 Gdrip
  });

  const generateAlert = (
    type: Alert['type'], 
    title: string, 
    message: string, 
    severity: Alert['severity']
  ): Alert => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: Date.now(),
    acknowledged: false,
    severity
  });

  useEffect(() => {
    const newAlerts: Alert[] = [];

    // Health check
    if (metrics.isHealthy === false) {
      newAlerts.push(generateAlert(
        'error', 
        'Node Health Critical', 
        'Multiple RPC endpoints are failing. Node may be disconnected or experiencing issues.',
        'critical'
      ));
    }

    // Sync lag check
    if (metrics.syncLag && metrics.syncLag > thresholds.maxSyncLag) {
      const severity = metrics.syncLag > 50 ? 'critical' : metrics.syncLag > 20 ? 'high' : 'medium';
      newAlerts.push(generateAlert(
        severity === 'critical' ? 'error' : 'warning',
        'High Sync Lag Detected',
        `Node is ${metrics.syncLag} blocks behind. Consider checking network connectivity.`,
        severity
      ));
    }

    // Peers check
    if (metrics.peers !== undefined && metrics.peers < thresholds.minPeers) {
      const severity = metrics.peers === 0 ? 'critical' : metrics.peers < 3 ? 'high' : 'medium';
      newAlerts.push(generateAlert(
        severity === 'critical' ? 'error' : 'warning',
        'Low Peer Count',
        `Only ${metrics.peers} peers connected. Network connectivity may be limited.`,
        severity
      ));
    }

    // Response time check
    if (metrics.responseTime && metrics.responseTime > thresholds.maxResponseTime) {
      const severity = metrics.responseTime > 10000 ? 'high' : 'medium';
      newAlerts.push(generateAlert(
        'warning',
        'High Response Time',
        `RPC responses taking ${(metrics.responseTime / 1000).toFixed(1)}s. Node may be overloaded.`,
        severity
      ));
    }

    // Pending transactions check
    if (metrics.pendingTxs && metrics.pendingTxs > thresholds.maxPendingTxs) {
      const severity = metrics.pendingTxs > 5000 ? 'high' : 'medium';
      newAlerts.push(generateAlert(
        'warning',
        'High Pending Transaction Count',
        `${metrics.pendingTxs.toLocaleString()} pending transactions. Network may be congested.`,
        severity
      ));
    }

    // Gas price check
    if (metrics.gasPrice && metrics.gasPrice > thresholds.maxGasPrice) {
      newAlerts.push(generateAlert(
        'info',
        'High Gas Price',
        `Gas price at ${(metrics.gasPrice / 1e9).toFixed(0)} Gdrip. Network demand is high.`,
        'low'
      ));
    }

    // Remove old alerts and add new ones
    setAlerts(prev => {
      const oneHourAgo = Date.now() - 3600000;
      const recentAlerts = prev.filter(alert => alert.timestamp > oneHourAgo);
      
      // Only add new alerts if they're not duplicates
      const existingTitles = recentAlerts.map(a => a.title);
      const uniqueNewAlerts = newAlerts.filter(alert => !existingTitles.includes(alert.title));
      
      return [...recentAlerts, ...uniqueNewAlerts].slice(-20); // Keep last 20 alerts
    });
  }, [metrics, thresholds]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const clearAll = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'low': return <Zap className="w-5 h-5 text-blue-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-900/20';
      case 'high': return 'border-l-orange-500 bg-orange-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-l-blue-500 bg-blue-900/20';
      default: return 'border-l-green-500 bg-green-900/20';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical').length;
  const highAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'high').length;

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-200">Alert System</h2>
        <div className="flex items-center gap-4">
          {criticalAlerts > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
              {criticalAlerts} Critical
            </span>
          )}
          {highAlerts > 0 && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-bold">
              {highAlerts} High
            </span>
          )}
          {unacknowledgedAlerts.length > 0 && (
            <button 
              onClick={clearAll}
              className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Threshold Configuration */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Alert Thresholds</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Max Sync Lag</label>
            <input
              type="number"
              value={thresholds.maxSyncLag}
              onChange={(e) => setThresholds(prev => ({ ...prev, maxSyncLag: +e.target.value }))}
              className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Min Peers</label>
            <input
              type="number"
              value={thresholds.minPeers}
              onChange={(e) => setThresholds(prev => ({ ...prev, minPeers: +e.target.value }))}
              className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Max Response Time (ms)</label>
            <input
              type="number"
              value={thresholds.maxResponseTime}
              onChange={(e) => setThresholds(prev => ({ ...prev, maxResponseTime: +e.target.value }))}
              className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-gray-400">
            <CheckCircle className="w-8 h-8 mr-2" />
            No alerts - All systems operational
          </div>
        ) : (
          alerts.slice().reverse().map(alert => (
            <div 
              key={alert.id} 
              className={`p-4 border-l-4 ${getSeverityColor(alert.severity)} rounded-r-lg ${
                alert.acknowledged ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {getSeverityIcon(alert.severity)}
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-200">{alert.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Ack
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}