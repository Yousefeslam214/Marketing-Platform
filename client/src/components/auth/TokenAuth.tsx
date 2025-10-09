import { useEffect } from "react";
import { TokenManager } from "@/lib/auth";

interface TokenAuthProps {
  onTokenDetected?: (token: string) => void;
  onRefetch?: () => void;
}

/**
 * TokenAuth component handles automatic authentication from URL parameters
 * Usage: <TokenAuth onRefetch={refetch} />
 * 
 * Features:
 * - Detects token parameter in URL (?token=...)
 * - Automatically saves token to localStorage
 * - Removes token from URL for security
 * - Triggers data refetch when token is detected
 * - Provides callback for custom handling
 */
export function TokenAuth({ onTokenDetected, onRefetch }: TokenAuthProps) {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("TokenAuth - URL Parameters:", urlParams.toString());
    const tokenFromUrl = urlParams.get("token");
    
    if (tokenFromUrl) {
      console.log("TokenAuth - Token detected from URL:", tokenFromUrl);
      
      // Set the token in localStorage for authentication
      TokenManager.setTokens(tokenFromUrl, "", ""); // We only have token, username and role will be fetched later
      
      // Remove token from URL for security and clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      console.log("TokenAuth - Token saved and URL cleaned");
      
      // Call custom callback if provided
      if (onTokenDetected) {
        onTokenDetected(tokenFromUrl);
      }
      
      // Trigger refetch of data with new token
      if (onRefetch) {
        setTimeout(() => {
          console.log("TokenAuth - Triggering data refetch");
          onRefetch();
        }, 100);
      }
    }
  }, [onTokenDetected, onRefetch]);

  // This component doesn't render anything
  return null;
}