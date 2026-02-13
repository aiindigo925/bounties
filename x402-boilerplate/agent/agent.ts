import axios from 'axios';
import { X402Challenge } from '../lib/x402';

interface PaymentHistory {
  url: string;
  amount: number;
  timestamp: number;
  txHash: string;
  success: boolean;
}

interface BudgetConfig {
  spendCap: number;
  maxSinglePayment: number;
  cooldownMs: number;
  maxRetries: number;
}

/**
 * Enhanced x402 Agent Client
 * Advanced autonomous agent with budget management, retry logic, and payment optimization
 */
class X402Agent {
  private config: BudgetConfig;
  private totalSpent: number = 0;
  private paymentHistory: PaymentHistory[] = [];
  private lastPaymentTime: number = 0;
  private failedAttempts: Map<string, number> = new Map();

  constructor(config: Partial<BudgetConfig> & { spendCap: number }) {
    this.config = {
      spendCap: config.spendCap,
      maxSinglePayment: config.maxSinglePayment || config.spendCap * 0.1, // Max 10% of budget per payment
      cooldownMs: config.cooldownMs || 5000, // 5 second cooldown between payments
      maxRetries: config.maxRetries || 3
    };
    
    console.log(`[Agent] Enhanced agent initialized`);
    console.log(`[Agent] Budget: ${this.config.spendCap} wei`);
    console.log(`[Agent] Max single payment: ${this.config.maxSinglePayment} wei`);
    console.log(`[Agent] Payment cooldown: ${this.config.cooldownMs}ms`);
  }

  // Enhanced budget checking with various safeguards
  private canAffordPayment(amount: number): { canPay: boolean; reason?: string } {
    if (this.totalSpent + amount > this.config.spendCap) {
      return { canPay: false, reason: 'Total budget exceeded' };
    }
    
    if (amount > this.config.maxSinglePayment) {
      return { canPay: false, reason: 'Single payment exceeds limit' };
    }
    
    const timeSinceLastPayment = Date.now() - this.lastPaymentTime;
    if (timeSinceLastPayment < this.config.cooldownMs) {
      return { canPay: false, reason: `Cooldown active (${this.config.cooldownMs - timeSinceLastPayment}ms remaining)` };
    }
    
    return { canPay: true };
  }

  // Get spending analytics
  getSpendingStats() {
    return {
      totalSpent: this.totalSpent,
      remainingBudget: this.config.spendCap - this.totalSpent,
      paymentCount: this.paymentHistory.length,
      successRate: this.paymentHistory.length > 0 ? 
        this.paymentHistory.filter(p => p.success).length / this.paymentHistory.length * 100 : 0,
      averagePayment: this.paymentHistory.length > 0 ? 
        this.totalSpent / this.paymentHistory.filter(p => p.success).length : 0
    };
  }

  async callApi(url: string, invoiceId?: string, attempt: number = 1): Promise<unknown> {
    const fullUrl = invoiceId ? `${url}?invoiceId=${invoiceId}` : url;
    console.log(`[Agent] Calling ${fullUrl} (attempt ${attempt}/${this.config.maxRetries})...`);

    try {
      const response = await axios.get(fullUrl, {
        validateStatus: (status) => status < 500, // Don't throw on 402
        timeout: 10000, // 10 second timeout
      });

      if (response.status === 402) {
        // Check if we've failed too many times on this URL
        const failures = this.failedAttempts.get(url) || 0;
        if (failures >= this.config.maxRetries) {
          console.error(`[Agent] URL ${url} has failed ${failures} times, skipping payment`);
          throw new Error(`Too many payment failures for URL: ${url}`);
        }
        
        return this.handle402(url, response.data.challenge as X402Challenge, attempt);
      }

      // Success - reset failure count
      this.failedAttempts.delete(url);
      console.log(`[Agent] Success! Data received from ${fullUrl}`);
      return response.data;
    } catch (error: unknown) {
      const errorMsg = (error as Error).message;
      console.error(`[Agent] Request failed (attempt ${attempt}): ${errorMsg}`);
      
      // Retry logic for non-402 errors
      if (attempt < this.config.maxRetries && !errorMsg.includes('payment')) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff
        console.log(`[Agent] Retrying in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return this.callApi(url, invoiceId, attempt + 1);
      }
      
      throw error;
    }
  }

  private async handle402(url: string, challenge: X402Challenge, attempt: number = 1): Promise<unknown> {
    const { amount, invoiceId, description } = challenge;
    const amountNum = parseInt(amount);

    console.log(`[Agent] 💰 Paywall encountered: ${description}`);
    console.log(`[Agent] 💵 Cost: ${amount} wei (${(amountNum / 1e18).toFixed(6)} CFX)`);
    
    // Enhanced budget validation
    const affordability = this.canAffordPayment(amountNum);
    if (!affordability.canPay) {
      console.error(`[Agent] ❌ Cannot process payment: ${affordability.reason}`);
      this.failedAttempts.set(url, (this.failedAttempts.get(url) || 0) + 1);
      throw new Error(`Payment declined: ${affordability.reason}`);
    }

    console.log(`[Agent] 🔄 Processing payment for invoice ${invoiceId}...`);
    
    let paymentSuccess = false;
    let txHash = '';
    
    try {
      // Simulate enhanced on-chain transaction with better randomization
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000)); // Realistic delay
      txHash = '0x' + Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      console.log(`[Agent] 📡 Transaction broadcasted: ${txHash}`);

      // Verify with seller
      console.log(`[Agent] ✅ Verifying payment with seller...`);
      const baseUrl = new URL(url).origin;
      
      await axios.post(`${baseUrl}/api/verify`, {
        invoiceId,
        txHash
      }, {
        timeout: 5000 // 5 second timeout for verification
      });

      // Record successful payment
      this.totalSpent += amountNum;
      this.lastPaymentTime = Date.now();
      paymentSuccess = true;
      
      this.paymentHistory.push({
        url,
        amount: amountNum,
        timestamp: Date.now(),
        txHash,
        success: true
      });

      console.log(`[Agent] 💚 Payment successful!`);
      console.log(`[Agent] 📊 Total spent: ${this.totalSpent} wei (${(this.totalSpent / 1e18).toFixed(6)} CFX)`);
      console.log(`[Agent] 💰 Remaining budget: ${this.config.spendCap - this.totalSpent} wei`);
      
      // Reset failure count on successful payment
      this.failedAttempts.delete(url);
      
    } catch (error: unknown) {
      console.error(`[Agent] ❌ Payment failed: ${(error as Error).message}`);
      
      // Record failed payment
      this.paymentHistory.push({
        url,
        amount: amountNum,
        timestamp: Date.now(),
        txHash,
        success: false
      });
      
      this.failedAttempts.set(url, (this.failedAttempts.get(url) || 0) + 1);
      throw error;
    }

    console.log(`[Agent] 🔄 Retrying original request with payment proof...`);
    return this.callApi(url, invoiceId, attempt);
  }
}

export { X402Agent };