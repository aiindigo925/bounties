'use client';

import { useQuery } from '@tanstack/react-query';
import { useConfluxClient } from '@/hooks/useConfluxClient';
import NetworkStatus from './NetworkStatus';

async function fetchStatus(client: any) {
  return await client.request({ method: 'cfx_getStatus' });
}

async function fetchLatestBlockNumber(client: any) {
  return await client.getBlockNumber();
}

export default function NetworkStatusHeader() {
  const client = useConfluxClient();

  const { data: status, error: statusError } = useQuery({
    queryKey: ['headerStatus'],
    queryFn: () => fetchStatus(client),
    refetchInterval: 10000,
  });

  const { data: blockNumber, error: blockError } = useQuery({
    queryKey: ['headerBlock'],
    queryFn: () => fetchLatestBlockNumber(client),
    refetchInterval: 10000,
  });

  const isHealthy = !statusError && !blockError;

  return (
    <NetworkStatus 
      isHealthy={isHealthy}
      chainId={status?.chainId}
      blockNumber={blockNumber ? Number(blockNumber) : undefined}
    />
  );
}