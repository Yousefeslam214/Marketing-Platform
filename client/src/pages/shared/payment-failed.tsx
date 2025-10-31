import { useEffect, useState } from "react";
import {
  XCircle,
  RefreshCw,
  Home,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useLanguage } from "../../hooks/use-language";

type ErrorData = {
  errorCode: string | null;
  errorMessage: string | null;
  transactionId: string | null;
  orderId: string | null;
  merchantOrderId: string | null;
  amount: string | null;
  currency: string;
  reason: string | null;
  timestamp: string;
};

export default function PaymentFailed() {
  const { t } = useLanguage();
  const [errorData, setErrorData] = useState<ErrorData | null>(null);

  useEffect(() => {
    // Extract error data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get("error_code");
    const errorMessage =
      urlParams.get("error_message") || urlParams.get("message");
    const transactionId =
      urlParams.get("txn_response_code") || urlParams.get("id");
    const orderId = urlParams.get("order");
    const merchantOrderId = urlParams.get("merchant_order_id");
    const amount = urlParams.get("amount_cents");
    const currency = urlParams.get("currency") || "EGP";
    const reason = urlParams.get("reason");

    setErrorData({
      errorCode,
      errorMessage,
      transactionId,
      orderId,
      merchantOrderId,
      amount: amount ? (parseInt(amount) / 100).toFixed(2) : null, // Convert from cents
      currency,
      reason,
      timestamp: new Date().toLocaleString(),
    });
  }, []);

  const handleRetryPayment = () => {
    // Navigate back to the payment page or billing page
    window.location.href = "/billing";
  };

  const handleContactSupport = () => {
    // TODO: Implement support contact functionality
    location.href = "/contact";

    // You could open a support ticket modal or redirect to support page
  };

  const handleGoHome = () => {
    window.location.href = "/campaigns";
  };

  const getErrorTitle = (errorCode: string | null) => {
    switch (errorCode) {
      case "DECLINED":
        return t("payment", "failedTitle") || "Payment Declined";
      case "INSUFFICIENT_FUNDS":
        return t("payment", "failedTitle") || "Insufficient Funds";
      case "EXPIRED_CARD":
        return t("payment", "failedTitle") || "Card Expired";
      case "INVALID_CARD":
        return t("payment", "failedTitle") || "Invalid Card";
      case "TIMEOUT":
        return t("payment", "failedTitle") || "Payment Timeout";
      default:
        return t("payment", "failedTitle") || "Payment Failed";
    }
  };

  const getErrorDescription = (
    errorCode: string | null,
    errorMessage: string | null
  ) => {
    if (errorMessage) return errorMessage;

    switch (errorCode) {
      case "DECLINED":
        return (
          t("payment", "errorDeclined") ||
          "Your payment was declined by the bank. Please try a different payment method."
        );
      case "INSUFFICIENT_FUNDS":
        return (
          t("payment", "errorInsufficient") ||
          "Your account has insufficient funds. Please check your balance and try again."
        );
      case "EXPIRED_CARD":
        return (
          t("payment", "errorExpired") ||
          "The payment card has expired. Please use a valid card."
        );
      case "INVALID_CARD":
        return (
          t("payment", "errorInvalid") ||
          "The card information is invalid. Please check your card details."
        );
      case "TIMEOUT":
        return (
          t("payment", "errorTimeout") ||
          "The payment request timed out. Please try again."
        );
      default:
        return (
          t("payment", "failedSubtitle") ||
          "An error occurred while processing your payment. Please try again."
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">
              {getErrorTitle(errorData?.errorCode ?? null)}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {getErrorDescription(
                errorData?.errorCode ?? null,
                errorData?.errorMessage ?? null
              )}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorData?.errorCode && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t("payment", "errorDetails")}</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {t("payment", "errorCode")}:
                      </span>
                      <Badge
                        variant="destructive"
                        className="font-mono text-xs">
                        {errorData.errorCode}
                      </Badge>
                    </div>
                    {errorData.reason && (
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {t("payment", "reason")}:
                        </span>
                        <span className="text-sm">{errorData.reason}</span>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {errorData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900 mb-3">
                  {t("payment", "transactionDetails")}
                </h3>

                {errorData.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {t("payment", "transactionId")}
                    </span>
                    <span className="font-mono text-sm">
                      {errorData.transactionId}
                    </span>
                  </div>
                )}

                {errorData.orderId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {t("payment", "orderId")}
                    </span>
                    <span className="font-mono text-sm">
                      {errorData.orderId}
                    </span>
                  </div>
                )}

                {errorData.amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {t("payment", "amount")}
                    </span>
                    <span className="font-semibold">
                      {errorData.amount} {errorData.currency}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {t("payment", "dateTime")}
                  </span>
                  <span className="text-sm">{errorData.timestamp}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleRetryPayment}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg">
                <RefreshCw className="w-4 h-4 mx-2" />
                {t("payment", "tryAgain")}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  size="sm">
                  <MessageCircle className="w-4 h-4 mx-2" />
                  {t("payment", "contactSupport")}
                </Button>

                <Button onClick={handleGoHome} variant="outline" size="sm">
                  <Home className="w-4 h-4 mx-2" />
                  {t("payment", "gotoads")}
                </Button>
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500">
                {t("payment", "supportText")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
