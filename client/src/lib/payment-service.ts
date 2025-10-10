// Payment service for handling Stripe payments
import { StripeService } from "@/lib/stripe";
import { TokenManager } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export interface PaymentData {
  amount: number;
  impressions: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeSessionResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    sessionId: string;
  };
}

export class PaymentService {
  private static readonly baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  // Create Stripe checkout session
  static async createCheckoutSession(
    paymentData: PaymentData
  ): Promise<StripeSessionResponse> {
    const token = TokenManager.getAccessToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${this.baseUrl}/api/payment/createSessionUrl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...paymentData,
          successUrl:
            paymentData.successUrl ||
            `${window.location.origin}/billing/success`,
          cancelUrl:
            paymentData.cancelUrl || `${window.location.origin}/billing/cancel`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`${response.status}: ${errorData}`);
    }

    return response.json();
  }

  // Redirect to Stripe checkout
  static async redirectToCheckout(paymentData: PaymentData): Promise<void> {
    try {
      const sessionResponse = await this.createCheckoutSession(paymentData);

      if (sessionResponse.success && sessionResponse.data?.url) {
        // Use Stripe's recommended redirect method
        window.location.href = sessionResponse.data.url;
      } else {
        throw new Error(
          sessionResponse.message || "Failed to create checkout session"
        );
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during payment.",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Verify payment success (call this on success page)
  static async verifyPayment(sessionId: string): Promise<any> {
    const token = TokenManager.getAccessToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${this.baseUrl}/api/payment/verify-session?session_id=${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`${response.status}: ${errorData}`);
    }

    return response.json();
  }

  // Get payment history
  static async getPaymentHistory(): Promise<any> {
    const token = TokenManager.getAccessToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${this.baseUrl}/api/payment/history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`${response.status}: ${errorData}`);
    }

    return response.json();
  }

  // Cancel payment session
  static async cancelPayment(sessionId: string): Promise<any> {
    const token = TokenManager.getAccessToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${this.baseUrl}/api/payment/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`${response.status}: ${errorData}`);
    }

    return response.json();
  }
}

// Webhook event types for payment processing
export enum PaymentEventType {
  PAYMENT_SUCCEEDED = "payment_intent.succeeded",
  PAYMENT_FAILED = "payment_intent.payment_failed",
  CHECKOUT_COMPLETED = "checkout.session.completed",
  INVOICE_PAID = "invoice.payment_succeeded",
  SUBSCRIPTION_CREATED = "customer.subscription.created",
}

// Payment status checker
export class PaymentStatusChecker {
  private static checkInterval: number | null = null;

  static startChecking(
    sessionId: string,
    onSuccess: () => void,
    onError: (error: any) => void
  ): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(async () => {
      try {
        const result = await PaymentService.verifyPayment(sessionId);
        if (result.success && result.data?.status === "complete") {
          this.stopChecking();
          onSuccess();
        }
      } catch (error) {
        this.stopChecking();
        onError(error);
      }
    }, 2000); // Check every 2 seconds
  }

  static stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default PaymentService;
