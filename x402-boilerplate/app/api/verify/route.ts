import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/x402';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { invoiceId, txHash } = body;

  if (!invoiceId || !txHash) {
    return NextResponse.json({ error: 'Missing invoiceId or txHash' }, { status: 400 });
  }

  const success = verifyPayment(invoiceId, txHash);

  if (success) {
    return NextResponse.json({ success: true, message: 'Payment verified' });
  } else {
    return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
  }
}
