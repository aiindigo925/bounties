'use client';

import { useState } from 'react';
import { callRpc } from '@/lib/rpc';

interface TestResult {
  method: string;
  success: boolean;
  responseTime: number;
  error?: string;
  result?: any;
}

const TEST_METHODS = [
  { method: 'cfx_getStatus', label: 'Node Status' },
  { method: 'cfx_gasPrice', label: 'Gas Price' },
  { method: 'net_peerCount', label: 'Peer Count' },
  { method: 'cfx_getClientVersion', label: 'Client Version' },
  { method: 'cfx_blockNumber', label: 'Block Number' },
];

interface ConnectionTesterProps {
  rpcUrl: string;
}

export default function ConnectionTester({ rpcUrl }: ConnectionTesterProps) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const testResults: TestResult[] = [];
    
    for (const test of TEST_METHODS) {
      const start = Date.now();
      try {
        const result = await callRpc(rpcUrl, test.method, []);
        const responseTime = Date.now() - start;
        
        testResults.push({
          method: test.method,
          success: true,
          responseTime,
          result: typeof result === 'object' ? JSON.stringify(result) : result
        });
      } catch (error: any) {
        const responseTime = Date.now() - start;
        testResults.push({
          method: test.method,
          success: false,
          responseTime,
          error: error.message
        });
      }
      
      setResults([...testResults]);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
    }
    
    setTesting(false);
  };

  const successCount = results.filter(r => r.success).length;
  const avgResponseTime = results.length > 0 ? 
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length : 0;

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-200">Connection Diagnostics</h3>
        <button
          onClick={runTests}
          disabled={testing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          {testing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Testing...</span>
            </>
          ) : (
            <span>Run Tests</span>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400">Success Rate</h4>
              <p className="text-2xl font-bold text-green-400">
                {((successCount / results.length) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500">{successCount}/{results.length} tests</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400">Avg Response</h4>
              <p className="text-2xl font-bold text-blue-400">
                {avgResponseTime.toFixed(0)}ms
              </p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400">Node URL</h4>
              <p className="text-sm font-mono text-gray-300 truncate">
                {rpcUrl}
              </p>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-200">Test Results</h4>
            {TEST_METHODS.map((test, index) => {
              const result = results.find(r => r.method === test.method);
              return (
                <div key={test.method} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          !result ? 'bg-gray-500' :
                          result.success ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <h5 className="font-medium text-gray-200">{test.label}</h5>
                        <code className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                          {test.method}
                        </code>
                      </div>
                      
                      {result && (
                        <div className="mt-2 ml-6">
                          {result.success ? (
                            <div className="text-sm">
                              <span className="text-green-400">✓ Success</span>
                              <span className="text-gray-400 ml-3">
                                {result.responseTime}ms
                              </span>
                              {result.result && (
                                <div className="mt-1">
                                  <code className="text-xs text-gray-300 bg-gray-600 px-2 py-1 rounded">
                                    {result.result.toString().length > 100 
                                      ? result.result.toString().substring(0, 100) + '...'
                                      : result.result}
                                  </code>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className="text-red-400">✗ Failed</span>
                              <span className="text-gray-400 ml-3">
                                {result.responseTime}ms
                              </span>
                              {result.error && (
                                <div className="mt-1 text-red-300 text-xs">
                                  {result.error}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}