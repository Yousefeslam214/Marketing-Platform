import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaymentService } from "@/lib/payment-service";
import { useToast } from "@/hooks/use-toast";

export function StripeTestComponent() {
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTestPayment = async () => {
    setLoading(true);
    try {
      const amountValue = parseFloat(amount);
      if (amountValue < 1) {
        throw new Error("Amount must be at least $1");
      }

      await PaymentService.redirectToCheckout({
        amount: amountValue * 100, // Convert to cents
        impressions: amountValue * 1000, // 1000 impressions per dollar
        currency: "USD",
      });
    } catch (error: any) {
      toast({
        title: "Test Payment Failed",
        description: error.message || "Failed to create test payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Stripe Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="amount" className="text-sm font-medium">
            Amount ($USD)
          </label>
          <Input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <Button
          onClick={handleTestPayment}
          disabled={loading}
          className="w-full">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating payment...</span>
            </div>
          ) : (
            "Test Stripe Payment"
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          This will redirect to Stripe's test checkout page. Use card number
          4242 4242 4242 4242 for testing.
        </p>
      </CardContent>
    </Card>
  );
}
