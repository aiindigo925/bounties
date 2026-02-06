import { NextRequest, NextResponse } from 'next/server';
import { createInvoice, createX402Response, isPaid } from '@/lib/x402';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('invoiceId');

  if (!invoiceId || !isPaid(invoiceId)) {
    const challenge = createInvoice(
      '/api/premium',
      '100000000000000000', // 0.1 CFX
      'Access to premium AI insights'
    );
    return createX402Response(challenge);
  }

  return NextResponse.json({
    data: "This is premium AI-generated content. The secret of the universe is 42.",
    timestamp: new Date().toISOString(),
    invoiceId,
  });
}
