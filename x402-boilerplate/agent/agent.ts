import axios from 'axios';
import { X402Challenge } from '../lib/x402';

/**
 * x402 Agent Client
 * Simple autonomous agent logic to handle 402 paywalls
 */
class X402Agent {
  private spendCap: number;
  private totalSpent: number = 0;

  constructor(spendCapWei: number) {
    this.spendCap = spendCapWei;
    console.log(`[Agent] Initialized with spend cap: ${spendCapWei} wei`);
  }

  async callApi(url: string, invoiceId?: string): Promise&lt;lt;lt;unknown> gt;{
    const fullUrl = invoiceId ? `${url}?invoiceId=${invoiceId}` : url;
    console.log(`[Agent] Calling ${fullUrl}...`);

    try {
      const response = await axios.get(fullUrl, {
        validateStatus: (status) => status &lt;lt;lt; 500, // Don't throw on 402
      });

      if (response.status === 402) {
        return this.handle402(url, response.data.challenge as X402Challenge);
      }

      console.log(`[Agent] Success! Data received.`);
      return response.data;
    } catch (error: unknown) {
      console.error(`[Agent] Request failed: ${(error as Error).message}`);
      throw error;
    }
  }

  private async handle402(url: string, challenge: X402Challenge): Promise&lt;lt;lt;unknown> gt;{
    const { amount, invoiceId, description } = challenge;
    const amountNum = parseInt(amount);

    console.log(`[Agent] Encountered paywall: ${description}`);
    console.log(`[Agent] Cost: ${amount} wei`);

    if (this.totalSpent + amountNum > gt;this.spendCap) {
      console.error(`[Agent] Budget exceeded! Cannot pay for this request.`);
      throw new Error('Budget exceeded');
    }

    console.log(`[Agent] Processing payment for invoice ${invoiceId}...`);
    
    // Simulate on-chain transaction signing and broadcasting
    const txHash = '0x' + Math.random().toString(16).substring(2, 66);
    console.log(`[Agent] Transaction broadcasted: ${txHash}`);

    // Verify with seller
    console.log(`[Agent] Verifying payment with seller...`);
    const baseUrl = new URL(url).origin;
    await axios.post(`${baseUrl}/api/verify`, {
      invoiceId,
      txHash
    });

    this.totalSpent += amountNum;
    console.log(`[Agent] Payment successful. Total spent: ${this.totalSpent} wei`);
    console.log(`[Agent] Retrying original request...`);

    return this.callApi(url, invoiceId);
  }
}

export { X402Agent };