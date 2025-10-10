import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoogleDirectAuth() {
  // Add immediate logging to ensure this component loads

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(true);
  const [statusMessage, setStatusMessage] = useState(
    "Processing Google authentication..."
  );

  useEffect(() => {
    const handleDirectAuth = async () => {
      try {
        setStatusMessage("Processing Google authentication...");

        // Check if this is running in a popup (for popup flow)
        const isPopup = false; // Disable popup functionality

        // Get URL parameters to check what we received
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        const token = urlParams.get("token");
        const username = urlParams.get("username");
        const role = urlParams.get("role");

        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }

        // If we already have token data from URL params (backend processed the auth)
        if (token && username && role) {
          setStatusMessage("Setting up your session...");

        

          setStatusMessage("Redirecting to dashboard...");

          toast({
            title: t("auth", "loginSuccess") || "Login successful",
            description: t("auth", "welcomeBack") || "Welcome back!",
          });

          // Clear the URL parameters and redirect to dashboard
          window.history.replaceState({}, document.title, "/dashboard");
          setLocation("/dashboard");

          // Force a page reload to ensure auth state is properly updated
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 100);
          return;
        }

        // If we have an authorization code, check if backend already processed it
        if (code) {
         
          setStatusMessage("Processing authentication...");

          // The backend should have already processed the code and returned data
          // Let's check if we're on the backend response page
          setTimeout(() => {
            // Try to parse any JSON response from the page
            const pageText =
              document.body.innerText || document.body.textContent || "";

            try {
              const responseData = JSON.parse(pageText);

              if (
                responseData.success &&
                responseData.data &&
                responseData.data.token
              ) {
                // Use the same logic as above for token processing
                const { token, role, username } = responseData.data;

                if (isPopup) {
                  // Handle popup communication
                  const pendingKeys = Object.keys(localStorage).filter((key) =>
                    key.endsWith("_pending")
                  );
                  if (pendingKeys.length > 0) {
                    const authKey = pendingKeys[0].replace("_pending", "");
                    const parentOrigin = localStorage.getItem(pendingKeys[0]);

                    localStorage.setItem(
                      authKey,
                      JSON.stringify({
                        success: true,
                        token: token,
                        username: username,
                        role: role,
                      })
                    );


                    try {
                      if (parentOrigin && window.opener) {
                        window.opener.postMessage(
                          {
                            success: true,
                            token: token,
                            username: username,
                            role: role,
                          },
                          parentOrigin
                        );
                      }
                    } catch (postMessageError) {
                      toast({
                        title:
                          t("auth", "loginFailed") || "Authentication failed",
                        description:
                          postMessageError instanceof Error
                            ? postMessageError.message
                            : "Failed to communicate with parent window",
                        variant: "destructive",
                      });
                    }
                  }

                  setStatusMessage(
                    "Authentication successful! Closing popup..."
                  );
                  setTimeout(() => {
                    window.close();
                  }, 1000);
                  return;
                } else {
                  // Handle direct authentication
                  AuthService.handleGoogleDirectAuth(
                    token,
                    username,
                    role
                  ).then(() => {
                    setStatusMessage("Redirecting to dashboard...");
                    toast({
                      title: t("auth", "loginSuccess") || "Login successful",
                      description: t("auth", "welcomeBack") || "Welcome back!",
                    });

                    window.history.replaceState(
                      {},
                      document.title,
                      "/dashboard"
                    );
                    setLocation("/dashboard");

                    setTimeout(() => {
                      window.location.href = "/dashboard";
                    }, 100);
                  });
                }
                return;
              }
            } catch (parseError) {
              toast({
                title: t("auth", "loginFailed") || "Authentication failed",
                description: (parseError instanceof Error ? parseError.message : "Failed to parse authentication response"),
                variant: "destructive",
              });
            }

            // If we still don't have auth data after a delay, there might be an error

            throw new Error("Authentication processing failed");
          }, 1000);

          return;
        }

        // If no code, try to parse JSON from page content as fallback
        if (window.location.pathname === "/api/auth/google/login") {
          setStatusMessage("Processing authentication response...");
          const pageText =
            document.body.innerText || document.body.textContent || "";

          try {
            const responseData = JSON.parse(pageText);

            if (
              responseData.success &&
              responseData.data &&
              responseData.data.token
            ) {
              const { token, role, username } = responseData.data;
              

              // Handle direct authentication (no popup logic)
              await AuthService.handleGoogleDirectAuth(token, username, role);

              toast({
                title: t("auth", "loginSuccess") || "Login successful",
                description: t("auth", "welcomeBack") || "Welcome back!",
              });

              // Clear the URL parameters and redirect to dashboard
              window.history.replaceState({}, document.title, "/dashboard");
              setLocation("/dashboard");

              // Force a page reload to ensure auth state is properly updated
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 1000);

              return;
            }
          } catch (jsonError) {
         toast({
              title: t("auth", "loginFailed") || "Authentication failed",
              description: (jsonError instanceof Error ? jsonError.message : "Failed to parse authentication response"),
              variant: "destructive",
            });
          }
        }

        throw new Error("No authorization code or valid response found");
      } catch (error) {
        setStatusMessage("Authentication failed");
        setIsProcessing(false);

        // Show error toast and redirect to login
        toast({
          title: t("auth", "loginFailed") || "Authentication failed",
          description: (error instanceof Error ? error.message : "Google authentication failed"),
          variant: "destructive",
        });

        // Redirect back to login page
        setTimeout(() => {
          setLocation("/login");
        }, 2000);
      }
    };

    // Small delay to ensure page and URL are ready
    setTimeout(handleDirectAuth, 200);
  }, [setLocation, toast, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-bolt text-primary-foreground text-lg"></i>
            </div>
            <CardTitle className="text-2xl">{t("auth", "loginTitle")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
            </div>
            <p className="text-muted-foreground">{statusMessage}</p>
            {!isProcessing && (
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
