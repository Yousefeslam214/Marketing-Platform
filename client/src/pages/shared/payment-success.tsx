import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Download, Home } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useLanguage } from "../../hooks/use-language";

export default function PaymentSuccess() {
  const { t } = useLanguage();
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    // Extract payment data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId =
      urlParams.get("txn_response_code") || urlParams.get("id");
    const amount = urlParams.get("amount_cents");
    const currency = urlParams.get("currency") || "EGP";
    const orderId = urlParams.get("order");
    const merchantOrderId = urlParams.get("merchant_order_id");
    const success = urlParams.get("success") === "true";
    const pending = urlParams.get("pending") === "true";

    console.log("Payment Success Page - URL Params:", {
      transactionId,
      amount,
      currency,
      orderId,
      merchantOrderId,
      success,
      pending,
    });

    setTransactionData({
      transactionId,
      amount: amount ? (parseInt(amount) / 100).toFixed(2) : null, // Convert from cents
      currency,
      orderId,
      merchantOrderId,
      success,
      pending,
      timestamp: new Date().toLocaleString(),
    });
  }, []);

  const handleContinueToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download functionality
  };

  const handleGoHome = () => {
    window.location.href = "/campaigns";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              {t("payment", "successTitle") || "Payment Successful!"}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {t("payment", "successSubtitle") ||
                "Your payment has been processed successfully"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {transactionData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {t("payment", "transactionId")}
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {transactionData.transactionId || "N/A"}
                  </Badge>
                </div>

                {transactionData.amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {t("payment", "amount")}
                    </span>
                    <span className="font-semibold text-green-600">
                      {transactionData.amount} {transactionData.currency}
                    </span>
                  </div>
                )}

                {transactionData.orderId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {t("payment", "orderId")}
                    </span>
                    <span className="font-mono text-sm">
                      {transactionData.orderId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {t("payment", "dateTime")}
                  </span>
                  <span className="text-sm">{transactionData.timestamp}</span>
                </div>

                {transactionData.pending && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm">
                      {t("payment", "successPending")}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleContinueToDashboard}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg">
                {t("payment", "successContinue")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDownloadReceipt}
                  variant="outline"
                  size="sm"
                  disabled={!transactionData?.transactionId}>
                  <Download className="w-4 h-4 mr-2" />
                  {t("payment", "successReceipt")}
                </Button>

                <Button onClick={handleGoHome} variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  {t("payment", "gotoads")}
                </Button>
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500">
                {t("payment", "successSupport")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
