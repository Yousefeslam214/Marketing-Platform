import { useEffect, useState } from "react";
import { XCircle, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/use-language";

export default function GoogleFailure() {
  const { t } = useLanguage();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error") || params.get("message");
    setMessage(error);
  }, []);

  const handleRetry = () => {
    // Redirect back to login which has Google sign-in button
    window.location.href = "/login";
  };

  const handleContact = () => {
    window.location.href = "/contact";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">
              {t("auth", "googleFailureTitle")}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {t("auth", "googleFailureDescription")}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <Alert>
                <AlertTitle>{t("auth", "error")}</AlertTitle>
                <AlertDescription className="mt-2">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full" size="lg">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                {t("auth", "retryWithGoogle")}
              </Button>

              <Button onClick={handleContact} variant="outline" size="sm" className="w-full">
                {t("auth", "contactSupport")}
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500">{t("auth", "googleFailureNote")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
