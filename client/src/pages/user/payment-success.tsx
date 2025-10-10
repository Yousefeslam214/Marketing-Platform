import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2 } from "lucide-react";
import { PaymentService } from "@/lib/payment-service";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

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
          title: t("billing", "paymentSuccessful") || "Payment Successful!",
          description:
            t("billing", "creditsAddedSuccess") ||
            "Your credits have been added to your account.",
          variant: "default",
        });
      } else {
        toast({
          title:
            t("billing", "paymentVerificationFailed") ||
            "Payment verification failed",
          description:
            t("billing", "contactSupportCredits") ||
            "Please contact support if credits are not reflected.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("billing", "verifyingPayment") || "Verification Error",
        description:
          error instanceof Error
            ? error.message
            : t("billing", "contactSupportCredits") ||
              "Failed to verify payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };



  if (isVerifying) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-background ${
          isRTL ? "rtl" : "ltr"
        }`}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">
                {t("billing", "verifyingPayment") || "Verifying Payment..."}
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                {t("billing", "paymentThankYou") ||
                  "Please wait while we confirm your payment."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-background p-4 ${
        isRTL ? "rtl" : "ltr"
      }`}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            {t("billing", "paymentSuccessful") || "Payment Successful!"}
          </CardTitle>
          <p className="text-muted-foreground">
            {t("billing", "paymentThankYou") ||
              "Thank you for your payment. Your transaction has been completed successfully."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-receipt text-primary"></i>
                {t("billing", "paymentDetails") || "Payment Details"}
              </h3>

              <div className="space-y-3">
                <div
                  className={`flex justify-between items-center ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <span className="text-muted-foreground">
                    {t("billing", "paymentAmount") || "Amount"}:
                  </span>
                  <span className="font-semibold text-lg">
                    ${(paymentDetails.amount / 100).toFixed(2)}
                  </span>
                </div>

                <Separator />

                <div
                  className={`flex justify-between items-center ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <span className="text-muted-foreground">
                    {t("billing", "creditsAdded") || "Credits Added"}:
                  </span>
                  <span className="font-semibold text-primary">
                    +{paymentDetails.impressions?.toLocaleString() || "N/A"}
                  </span>
                </div>

                <div
                  className={`flex justify-between items-center ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <span className="text-muted-foreground">
                    {t("billing", "status") || "Status"}:
                  </span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800">
                    <i className="fas fa-check mr-1"></i>
                    {t("billing", "completed") || "Completed"}
                  </Badge>
                </div>

                <div
                  className={`flex justify-between items-center ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <span className="text-muted-foreground">
                    {t("billing", "transactionId") || "Payment ID"}:
                  </span>
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {paymentDetails.paymentId}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              {t("billing", "nextSteps") || "What's Next?"}
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-blue-600 mt-0.5"></i>
                {t("billing", "creditsAddedSuccess") ||
                  "Your credits have been added to your account"}
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-blue-600 mt-0.5"></i>
                {t("billing", "startCreating") ||
                  "You can now start creating and running ads"}
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-blue-600 mt-0.5"></i>
                {t("billing", "receiptEmail") ||
                  "A receipt has been sent to your email"}
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="flex-1">
              <i
                className={`fas fa-tachometer-alt ${
                  isRTL ? "ml-2" : "mr-2"
                }`}></i>
              {t("common", "dashboard") || "Go to Dashboard"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/campaigns/new")}
              className="flex-1">
              <i className={`fas fa-plus ${isRTL ? "ml-2" : "mr-2"}`}></i>
              {t("ads", "createAd") || "Create Ad"}
            </Button>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              {t("billing", "creditsAddedSuccess") ||
                "Your credits have been added to your account and are ready to use!"}
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => setLocation("/billing")}
                className="flex-1">
                {t("billing", "backToBilling") || "Continue to Billing"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="flex-1">
                {t("common", "dashboard") || "Go to Dashboard"}
              </Button>
            </div>
          </div>

          {/* Support */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              {t("billing", "needHelp") ||
                "Need help? Contact our support team"}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/contact")}>
              <i className={`fas fa-headset ${isRTL ? "ml-2" : "mr-2"}`}></i>
              {t("common", "contactSupport") || "Contact Support"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
