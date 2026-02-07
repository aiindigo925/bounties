'use client';
import { createContext, useContext, useState, useEffect, React.ReactNode } from 'react';

interface RpcContextType {
  rpcUrl: string;
  setRpcUrl: (url: string) => void;
}

const RpcContext = createContext<RpcContextType | null>(null);

export function RpcProvider({ children }: { children: React.ReactNode }) {
  const [rpcUrl, setRpcUrl] = useState('http://localhost:12537');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rpcUrl');
      if (saved) setRpcUrl(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rpcUrl', rpcUrl);
    }
  }, [rpcUrl]);

  return (
    <RpcContext.Provider value={{ rpcUrl, setRpcUrl }}>
      {children}
    </RpcContext.Provider>
  );
}

export const useRpc = () => {
  const context = useContext(RpcContext);
  if (!context) {
    throw new Error('useRpc must be used within RpcProvider');
  }
  return context;
};