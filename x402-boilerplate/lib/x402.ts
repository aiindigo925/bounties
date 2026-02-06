import { NextRequest, NextResponse } from 'next/server';

export interface X402Challenge {
  amount: string; // in wei
  token: string;
  nonce: string;
  expiry: number;
  endpoint: string;
  invoiceId: string;
  description: string;
}

export function createX402Response(challenge: X402Challenge) {
  return new NextResponse(
    JSON.stringify({
      error: 'Payment Required',
      message: challenge.description,
      challenge,
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Amount': challenge.amount,
        'X-Payment-Token': challenge.token,
        'X-Payment-Nonce': challenge.nonce,
        'X-Payment-Expiry': challenge.expiry.toString(),
        'X-Payment-Endpoint': challenge.endpoint,
        'X-Payment-Invoice-Id': challenge.invoiceId,
        'X-Payment-Description': challenge.description,
      },
    }
  );
}

// In-memory mock database for invoices and receipts (replace with Postgres in production)
const invoices = new Map<string, X402Challenge & { status: 'pending' | 'paid' }>();
const receipts = new Map<string, string>(); // invoiceId -> txHash

export function createInvoice(endpoint: string, amount: string, description: string): X402Challenge {
  const invoiceId = Math.random().toString(36).substring(2, 15);
  const challenge: X402Challenge = {
    amount,
    token: '0x0000000000000000000000000000000000000000', // Native CFX
    nonce: Math.random().toString(36).substring(2, 15),
    expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    endpoint,
    invoiceId,
    description,
  };
  invoices.set(invoiceId, { ...challenge, status: 'pending' });
  return challenge;
}

export function verifyPayment(invoiceId: string, txHash: string): boolean {
  const invoice = invoices.get(invoiceId);
  if (invoice && invoice.status === 'pending') {
    // In a real app, verify the txHash on-chain using viem/ethers
    invoice.status = 'paid';
    receipts.set(invoiceId, txHash);
    return true;
  }
  return invoice?.status === 'paid' || false;
}

export function isPaid(invoiceId: string): boolean {
  return invoices.get(invoiceId)?.status === 'paid' || false;
}
