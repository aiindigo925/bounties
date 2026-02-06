import axios from 'axios';

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

  async callApi(url: string, invoiceId?: string): Promise<any> {
    const fullUrl = invoiceId ? `${url}?invoiceId=${invoiceId}` : url;
    console.log(`[Agent] Calling ${fullUrl}...`);

    try {
      const response = await axios.get(fullUrl, {
        validateStatus: (status) => status < 500, // Don't throw on 402
      });

      if (response.status === 402) {
        return this.handle402(url, response.data.challenge);
      }

      console.log(`[Agent] Success! Data received.`);
      return response.data;
    } catch (error: any) {
      console.error(`[Agent] Request failed: ${error.message}`);
      throw error;
    }
  }

  private async handle402(url: string, challenge: any): Promise<any> {
    const { amount, invoiceId, description } = challenge;
    const amountNum = parseInt(amount);

    console.log(`[Agent] Encountered paywall: ${description}`);
    console.log(`[Agent] Cost: ${amount} wei`);

    if (this.totalSpent + amountNum > this.spendCap) {
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

// Demo Execution
async function runDemo() {
  const agent = new X402Agent(1000000000000000000); // 1 CFX cap
  const apiUrl = 'http://localhost:3000/api/premium';

  console.log('--- Starting x402 Agent Demo ---');
  try {
    const result = await agent.callApi(apiUrl);
    console.log('--- Final Result ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log('--- Demo Failed ---');
  }
}

// In a real scenario, this would be a long-running process
// runDemo();

export { X402Agent };
