"use client";

import { useState } from 'react';
import { Shield, Coins, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const fetchPremiumData = async (invoiceId?: string) => {
    setLoading(true);
    setError(null);
    addLog(`Calling GET /api/premium${invoiceId ? `?invoiceId=${invoiceId}` : ''}...`);

    try {
      const url = invoiceId ? `/api/premium?invoiceId=${invoiceId}` : '/api/premium';
      const res = await fetch(url);
      
      if (res.status === 402) {
        const challenge = await res.json();
        addLog(`Received 402 Payment Required`);
        setError({ type: '402', ...challenge });
      } else {
        const result = await res.json();
        setData(result);
        setError(null);
        addLog(`Success! Received premium data.`);
      }
    } catch (err: unknown) {
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!error || !error.challenge) return;
    
    setLoading(true);
    const { invoiceId, amount } = error.challenge;
    addLog(`Initiating payment for invoice ${invoiceId} (Amount: ${amount} wei)...`);
    
    // Simulate on-chain transaction
    setTimeout(async () => {
      const txHash = '0x' + Math.random().toString(16).substring(2, 66);
      addLog(`Transaction sent: ${txHash}`);
      
      addLog(`Verifying payment with backend...`);
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, txHash }),
      });
      
      if (verifyRes.ok) {
        addLog(`Payment verified successfully!`);
        fetchPremiumData(invoiceId);
      } else {
        addLog(`Payment verification failed.`);
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">x402 Boilerplate</h1>
              <p className="text-slate-400 text-sm">Autonomous Agent Payment Standard</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => fetchPremiumData()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              Fetch Premium Data
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Display */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[300px] flex flex-col">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                Response Buffer
              </h2>
              
              {!data && !error && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic">
                  No data requested yet.
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-slate-400">Processing...</p>
                </div>
              )}

              {error && error.type === '402' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg w-full">
                    <div className="flex items-center gap-3 text-yellow-500 font-bold mb-2">
                      <AlertCircle className="w-5 h-5" />
                      402 PAYMENT REQUIRED
                    </div>
                    <p className="text-slate-300 text-sm mb-4">{error.message}</p>
                    <div className="bg-slate-950 p-3 rounded text-xs font-mono text-slate-400 mb-4 overflow-hidden text-ellipsis">
                      Invoice: {error.challenge.invoiceId}<br/>
                      Amount: {error.challenge.amount} wei
                    </div>
                    <button 
                      onClick={handlePay}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded transition-colors"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </div>
              )}

              {data && (
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3 text-green-500 font-bold mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      SUCCESS
                    </div>
                    <pre className="text-slate-200 text-sm whitespace-pre-wrap font-mono">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logs / Console */}
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-[400px] flex flex-col">
              <h2 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                Execution Logs
              </h2>
              <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 text-slate-400">
                {logs.length === 0 && <span className="italic text-slate-600">Waiting for activity...</span>}
                {logs.map((log, i) => (
                  <div key={i} className="border-l border-slate-800 pl-2 py-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <section className="bg-blue-600/5 border border-blue-600/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">How it works</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            The <strong>x402 Protocol</strong> allows AI agents to navigate paywalled APIs autonomously. 
            When a server returns a <code>402 Payment Required</code> status, it includes standardized headers 
            defining the cost and destination. The agent detects this, signs a transaction, and retries the 
            original request with the payment proof.
          </p>
        </section>
      </div>
    </main>
  );
}
