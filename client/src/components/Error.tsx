import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  onHome?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error has occurred. Please try again.",
  onRetry,
  showHomeButton = true,
  onHome,
}: ErrorProps) {
  const { t, language } = useLanguage();

  return (
    <div className="flex items-center justify-center h-full p-6">
      {" "}
      <Card className="max-w-md w-full">
        {" "}
        <CardContent className="p-8 flex flex-col items-center text-center">
          {" "}
          <i className="fas fa-exclamation-triangle text-destructive text-5xl mb-4"></i>{" "}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {title}{" "}
          </h2>{" "}
          <p className="text-sm text-muted-foreground mb-6">{message} </p>
          <div className="flex gap-3">
            {onRetry && (
              <Button onClick={onRetry} data-testid="button-retry">
                {language === "ar" ? (
                  <>
                    {t("error", "retry") || "Retry"}
                    <i className="fas fa-redo mr-2"></i>
                  </>
                ) : (
                  <>
                    <i className="fas fa-redo mr-2"></i>
                    {t("error", "retry") || "Retry"}
                  </>
                )}
              </Button>
            )}
            {showHomeButton && (
              <Button
                variant="outline"
                onClick={onHome}
                data-testid="button-home">
                {language === "ar" ? (
                  <>
                    {t("error", "home") || "Home"}
                    <i className="fas fa-home ml-2"></i>
                  </>
                ) : (
                  <>
                    <i className="fas fa-home mr-2"></i>
                    {t("error", "home") || "Home"}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
