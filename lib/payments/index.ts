import { config } from '../config';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  userId: string;
  subscriptionTier: 'silver' | 'gold';
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'freemium' | 'silver' | 'gold';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: Date;
  priceId: string;
}

export class PaymentService {
  async createPaymentIntent(
    amount: number,
    userId: string,
    subscriptionTier: 'silver' | 'gold'
  ): Promise<PaymentIntent> {
    if (config.isDevelopment) {
      // Mock payment for development
      return {
        id: `pi_mock_${Date.now()}`,
        amount,
        currency: 'SEK',
        status: 'succeeded',
        userId,
        subscriptionTier
      };
    }
    
    throw new Error('Production payment processing not yet implemented');
  }
  
  async createSubscription(
    userId: string,
    tier: 'silver' | 'gold',
    paymentMethodId: string
  ): Promise<Subscription> {
    if (config.isDevelopment) {
      // Mock subscription for development
      return {
        id: `sub_mock_${Date.now()}`,
        userId,
        tier,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        priceId: `price_${tier}_mock`
      };
    }
    
    throw new Error('Production subscription management not yet implemented');
  }
  
  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (config.isDevelopment) {
      console.log(`Mock: Cancelled subscription ${subscriptionId}`);
      return;
    }
    
    throw new Error('Production subscription management not yet implemented');
  }
  
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    // TODO: Implement actual subscription lookup
    return null;
  }
  
  async webhookHandler(payload: string, signature: string): Promise<void> {
    if (config.isDevelopment) {
      console.log('Mock: Webhook received', { payload, signature });
      return;
    }
    
    throw new Error('Production webhook handling not yet implemented');
  }
}

export const paymentService = new PaymentService();