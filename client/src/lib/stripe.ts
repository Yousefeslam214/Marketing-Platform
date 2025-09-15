import { loadStripe, Stripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.error("Missing VITE_STRIPE_PUBLIC_KEY environment variable");
}

// Cache the Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise && stripePublicKey) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise || Promise.resolve(null);
};

// Stripe utilities and helpers
export class StripeService {
  private static stripe: Stripe | null = null;

  static async getInstance(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await getStripe();
    }
    return this.stripe;
  }

  // Redirect to Stripe Checkout
  static async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.getInstance();
    if (!stripe) {
      throw new Error("Stripe is not initialized");
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Handle payment with Payment Element
  static async confirmPayment(
    clientSecret: string,
    returnUrl: string = window.location.origin
  ): Promise<{ error?: any; paymentIntent?: any }> {
    const stripe = await this.getInstance();
    if (!stripe) {
      throw new Error("Stripe is not initialized");
    }

    return stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: returnUrl,
      },
    });
  }

  // Create payment method
  static async createPaymentMethod(
    type: "card" | "ideal" | "sepa_debit" = "card",
    element?: any
  ): Promise<{ error?: any; paymentMethod?: any }> {
    const stripe = await this.getInstance();
    if (!stripe) {
      throw new Error("Stripe is not initialized");
    }

    return stripe.createPaymentMethod({
      type,
      ...(element && { card: element }),
    });
  }

  // Retrieve payment intent
  static async retrievePaymentIntent(clientSecret: string): Promise<{ error?: any; paymentIntent?: any }> {
    const stripe = await this.getInstance();
    if (!stripe) {
      throw new Error("Stripe is not initialized");
    }

    return stripe.retrievePaymentIntent(clientSecret);
  }
}

// Payment status utilities
export enum PaymentStatus {
  REQUIRES_PAYMENT_METHOD = "requires_payment_method",
  REQUIRES_CONFIRMATION = "requires_confirmation",
  REQUIRES_ACTION = "requires_action",
  PROCESSING = "processing",
  REQUIRES_CAPTURE = "requires_capture",
  CANCELED = "canceled",
  SUCCEEDED = "succeeded",
}

export class PaymentStatusHandler {
  static isPaymentSuccessful(status: string): boolean {
    return status === PaymentStatus.SUCCEEDED;
  }

  static isPaymentFailed(status: string): boolean {
    return status === PaymentStatus.CANCELED;
  }

  static requiresAction(status: string): boolean {
    return status === PaymentStatus.REQUIRES_ACTION || 
           status === PaymentStatus.REQUIRES_CONFIRMATION;
  }

  static isProcessing(status: string): boolean {
    return status === PaymentStatus.PROCESSING;
  }

  static getStatusMessage(status: string): string {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return "Payment successful";
      case PaymentStatus.PROCESSING:
        return "Payment is being processed";
      case PaymentStatus.REQUIRES_ACTION:
        return "Payment requires additional action";
      case PaymentStatus.REQUIRES_CONFIRMATION:
        return "Payment requires confirmation";
      case PaymentStatus.CANCELED:
        return "Payment was canceled";
      default:
        return "Payment status unknown";
    }
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return "text-green-600";
      case PaymentStatus.PROCESSING:
        return "text-blue-600";
      case PaymentStatus.REQUIRES_ACTION:
      case PaymentStatus.REQUIRES_CONFIRMATION:
        return "text-yellow-600";
      case PaymentStatus.CANCELED:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }
}

// Price formatting utilities
export class PriceFormatter {
  static formatPrice(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100); // Stripe amounts are in cents
  }

  static formatPriceCompact(amount: number, currency: string = "USD"): string {
    const formatted = this.formatPrice(amount, currency);
    return formatted.replace(/\.00$/, ""); // Remove .00 for whole numbers
  }

  static parsePriceToStripeAmount(price: string): number {
    const cleanPrice = price.replace(/[^0-9.]/g, "");
    return Math.round(parseFloat(cleanPrice) * 100);
  }
}

// Webhook signature verification (for server-side use)
export class WebhookHandler {
  static constructEvent(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): any {
    // This would typically be done on the server side
    // Included here for reference
    throw new Error("Webhook verification should be done server-side");
  }

  static verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Implement signature verification logic
    // This is typically handled by Stripe's libraries
    return false;
  }
}

// Error handling for Stripe operations
export class StripeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public type?: string,
    public param?: string
  ) {
    super(message);
    this.name = "StripeError";
  }

  static fromStripeError(error: any): StripeError {
    return new StripeError(
      error.message || "Unknown Stripe error",
      error.code,
      error.type,
      error.param
    );
  }
}

// Constants for common Stripe configurations
export const STRIPE_CONFIG = {
  // Appearance configuration for Stripe Elements
  appearance: {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "hsl(221.2 83.2% 53.3%)",
      colorBackground: "hsl(0 0% 100%)",
      colorText: "hsl(222.2 84% 4.9%)",
      colorDanger: "hsl(0 84.2% 60.2%)",
      fontFamily: "Inter, system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
  },

  // Options for payment elements
  paymentElementOptions: {
    layout: "tabs" as const,
    defaultValues: {
      billingDetails: {
        name: "",
        email: "",
      },
    },
  },

  // Supported payment methods
  paymentMethods: [
    "card",
    "ideal", // For European customers
    "sepa_debit", // For European customers
    "sofort", // For European customers
  ],
} as const;

export default StripeService;
