import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export default function PaymentCancel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. No charges were made.",
      variant: "default",
    });
  }, [toast]);

  const handleRetry = () => {
    setLocation("/billing");
  };

  const handleDashboard = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl text-yellow-600">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your payment was cancelled and no charges were made to your
              account.
            </p>

            <p className="text-sm text-muted-foreground">
              You can retry the payment anytime or continue browsing the
              platform.
            </p>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleRetry} className="flex-1">
                Retry Payment
              </Button>
              <Button
                variant="outline"
                onClick={handleDashboard}
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
