import { toast } from "@/hooks/use-toast";
import { TokenManager } from "./auth";
import { VITE_API_BASE_URL } from "./utils";

const token = TokenManager.getAccessToken();

export const handleApprove = async (
  id: string,
  isRTL: boolean,
  refetch: () => void
) => {
  const res = await fetch(
    `${VITE_API_BASE_URL}/api/advertising/${id}/approve`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (res.ok) {
    toast({ title: isRTL ? "تمت الموافقة على الإعلان" : "Ad approved" });
    refetch();
  } else {
    toast({
      title: isRTL ? "فشل في الموافقة على الإعلان" : "Failed to approve ad",
      variant: "destructive",
    });
  }
};

export const handleReject = async (
  id: string,
  isRTL: boolean,
  refetch: () => void
) => {
  const res = await fetch(`${VITE_API_BASE_URL}/api/advertising/${id}/reject`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    toast({ title: isRTL ? "تم رفض الإعلان" : "Ad rejected" });
    refetch();
  } else {
    toast({
      title: isRTL ? "فشل في رفض الإعلان" : "Failed to reject ad",
      variant: "destructive",
    });
  }
};
