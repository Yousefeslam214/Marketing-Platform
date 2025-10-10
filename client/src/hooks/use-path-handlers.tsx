import { useLocation } from "wouter";

export function useAdNavigation() {
  const [, setLocation] = useLocation();

  const handleCreateAd = () => setLocation("/campaigns/new");

  const handleViewAd = (id: string) => setLocation(`/campaigns/${id}`);

  const handleEditAd = (id: string) => setLocation(`/ads/${id}/edit`);

  const handleAnalytics = (id: string) => setLocation(`/campaigns/${id}/analytics`);

  const handlePurchase = (id: string) => setLocation(`/campaigns/${id}/purchase`);

  return {
    handleCreateAd,
    handleViewAd,
    handleEditAd,
    handleAnalytics,
    handlePurchase,
  };
}
