export async function callRpc(rpcUrl: string, method: string, params: any[] = []): Promise&lt;any&gt; {
  const req = {jsonrpc: \'2.0\', id: Date.now(), method, params};
  const res = await fetch(rpcUrl, {
    method: \'POST\',
    headers: {\'Content-Type\': \'application/json\'},
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json() as any;
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.result;
}

export const getStatus = (rpcUrl: string) => callRpc(rpcUrl, \'cfx_getStatus\', []);
export const getGasPrice = (rpcUrl: string) => callRpc(rpcUrl, \'cfx_gasPrice\', []);
export const getPeersCount = (rpcUrl: string) => callRpc(rpcUrl, \'net_peerCount\', []);
export const getClientVersion = (rpcUrl: string) => callRpc(rpcUrl, \'cfx_getClientVersion\', []);
export const getBlockNumber = (rpcUrl: string) => callRpc(rpcUrl, \'cfx_blockNumber\', []);