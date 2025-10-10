import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { TokenManager } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { VITE_API_BASE_URL } from "@/lib/utils";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";
import { AdEditor } from "@/components/ads/ad-editor-update";

export default function UpdateAd() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/ads/:adId/edit");

  // Check auth and route validity
  const isAuthenticated = !!TokenManager.getAccessToken();
  const hasValidRoute = match && params?.adId;

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    if (!hasValidRoute) {
      setLocation("/campaigns");
      return;
    }
  }, [isAuthenticated, hasValidRoute, setLocation]);

  // Fetch existing ad data only if we have valid auth and route
  const {
    data: adData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/advertising/${params?.adId}/edit`],
    queryFn: async () => {
      if (!params?.adId) throw new Error("No ad ID");
      const response = await apiRequest(
        "GET",
        `${VITE_API_BASE_URL}/api/advertising/${params.adId}`
      );
      return response.json();
    },
    enabled: isAuthenticated && !!params?.adId, // Only run query if conditions are met
  });

  // Show loading while checking auth/route or fetching data
  if (!isAuthenticated || !hasValidRoute || isLoading) {
    return <Loading />;
  }

  if (error || !adData?.success) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 overflow-auto">
          <Header
            title="Update Ad"
            description="Edit and update your advertising campaign"
          />
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <ErrorState title="Failed to load ad" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <Header
          title="Update Ad"
          description="Edit and update your advertising campaign"
        />

        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <AdEditor
              adId={params?.adId || ""}
              existingData={adData.data}
              isUpdate={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
