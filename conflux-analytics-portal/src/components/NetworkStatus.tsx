interface NetworkStatusProps {
  isHealthy: boolean;
  chainId?: string;
  blockNumber?: number;
  className?: string;
}

export default function NetworkStatus({ 
  isHealthy, 
  chainId, 
  blockNumber, 
  className = '' 
}: NetworkStatusProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      <span className={`text-sm font-medium ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
        {isHealthy ? 'Connected' : 'Connection Issues'}
      </span>
      {isHealthy && chainId && blockNumber && (
        <span className="text-xs text-gray-500 ml-4">
          Chain {parseInt(chainId, 16)} • Block {blockNumber.toLocaleString()}
        </span>
      )}
    </div>
  );
}