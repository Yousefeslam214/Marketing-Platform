import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoogleCallback() {
  const [statusMessage, setStatusMessage] = useState(
    "Processing Google authentication..."
  );

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatusMessage("Extracting authorization code...");

        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error("No authorization code received from Google");
        }

        setStatusMessage("Exchanging code for access token...");
        console.log("Exchanging authorization code:", code);

        // Call your backend API to exchange the code for tokens
        const response = await fetch(
          `${window.location.origin}/api/auth/google/callback?code=${code}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Backend response:", data);

        if (data.success && data.data?.token) {
          setStatusMessage("Authentication successful! Redirecting...");

          // Redirect directly to dashboard with token parameter
          window.location.href = `/dashboard?token=${data.data.token}&username=${data.data.username || data.data.name}&role=${data.data.role || "user"}`;
        } else {
          throw new Error(
            data.message || "Invalid response format from backend"
          );
        }
      } catch (error: any) {
        console.error("Google OAuth callback error:", error);
        setStatusMessage(`Authentication failed: ${error.message}`);

        // Redirect to login page after showing error
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    };

    // Execute callback handling after component mounts
    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-bolt text-primary-foreground text-lg"></i>
            </div>
            <CardTitle className="text-2xl">octopusad</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
            </div>
            <p className="text-muted-foreground">{statusMessage}</p>
            <p className="text-xs text-muted-foreground">
              Please don't close this window...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
