import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { PaymentService } from "@/lib/payment-service";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setIsVerifying(false);
      toast({
        title: "Invalid payment session",
        description: "No session ID found",
        variant: "destructive",
      });
    }
  }, []);

  const verifyPayment = async (sessionId: string) => {
    try {
      const result = await PaymentService.verifyPayment(sessionId);
      setPaymentDetails(result.data);

      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: "Your credits have been added to your account.",
          variant: "default",
        });
      } else {
        toast({
          title: "Payment verification failed",
          description: "Please contact support if credits are not reflected.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    setLocation("/billing");
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Verifying Payment...</h2>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we confirm your payment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentDetails && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">
                  ${(paymentDetails.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Added:</span>
                <span className="font-medium">
                  {paymentDetails.impressions?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-mono text-xs">
                  {paymentDetails.paymentId}
                </span>
              </div>
            </div>
          )}

          <div className="pt-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Your credits have been added to your account and are ready to use!
            </p>

            <div className="flex gap-2">
              <Button onClick={handleContinue} className="flex-1">
                Continue to Billing
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="flex-1">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
