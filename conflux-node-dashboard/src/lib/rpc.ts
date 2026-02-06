const RPC_URL = 'https://main.confluxrpc.com';

type RpcRequest = {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any[];
};

type RpcResponse<T = any> = {
  jsonrpc: '2.0';
  id: number;
  result: T;
  error?: any;
};

export async function callRpc(method: string, params: any[] = []): Promise<any> {
  const req: RpcRequest = { jsonrpc: '2.0', id: Date.now(), method, params };
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`RPC error: ${res.status}`);
  const data: RpcResponse = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

export const getStatus = () => callRpc('cfx_getStatus', []);

export const getGasPrice = () => callRpc('cfx_gasPrice', []);