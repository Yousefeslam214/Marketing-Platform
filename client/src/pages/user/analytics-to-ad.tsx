import { useParams } from "wouter"; // أو أي Router عندك
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
// import { useApiQuery } from "@/hooks/use-api-query"; // الهُوك بتاعك
// import { VITE_API_BASE_URL } from "@/lib/config";

async function fetchInsights(pageId: string, postId: string) {
  const res = await fetch(
    `${VITE_API_BASE_URL}/api/advertising/insights/pages/${pageId}/posts/${postId}`
  );
  if (!res.ok) throw new Error("Failed to fetch insights");
  return res.json();
}

export default function AnalyticsToAd() {
  const { id } = useParams();
  const safeId = id ?? "";

  const {
    data: adData,
    isLoading: adLoading,
    error: adError,
  } = useApiQuery({
    key: ["/ads", safeId],
    url: `${VITE_API_BASE_URL}/api/advertising/${safeId}`,
  });

  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
  } = useApiQuery({
    key: ["insights", adData?.data?.pageId, adData?.data?.postIdOnPlatform],
    url: adData?.data
      ? `${VITE_API_BASE_URL}/api/advertising/insights/pages/${adData?.data?.pageId}/posts/${adData?.data?.postIdOnPlatform}`
      : "", // Always pass a string
    enabled: !!adData?.data?.pageId && !!adData?.data?.postIdOnPlatform,
  });

  if (adLoading) return <p>Loading ad...</p>;
  if (adError)
    return (
      <p>
        {adError.message}
        Error loading ad.
      </p>
    );

  return (
    <div className="p-6 space-y-6">
      {/* بيانات الإعلان */}
      {adData?.data && (
        <Card>
          <CardHeader>
            <CardTitle>{adData.data.titleEn}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{adData.data.descriptionEn}</p>
            <Badge className={getStatusColor(adData.data.status)}>
              {adData.data.status}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* الـ Insights */}
      {insightsLoading && <p>Loading insights...</p>}
      {insightsError && <p>Error loading insights.</p>}
      {insightsData?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Post Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div>👍 Likes: {insightsData.data.insights.likes}</div>
              <div>💬 Comments: {insightsData.data.insights.comments}</div>
              <div>🔄 Shares: {insightsData.data.insights.shares}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
