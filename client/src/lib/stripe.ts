// Minimal StripeService stub to satisfy imports during TypeScript checks.
// Replace with real implementation when integrating Stripe.
export class StripeService {
  static async createCheckoutSession(amount: number) {
    // placeholder implementation for type checking
    return { url: "/checkout-placeholder" };
  }
}

export default StripeService;
