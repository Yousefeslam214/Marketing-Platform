import { toast } from "@/hooks/use-toast";
import { TokenManager } from "./auth";
import { VITE_API_BASE_URL } from "./utils";

export const handleApprove = async (
  id: string,
  isRTL: boolean,
  refetch: () => void
) => {
  try {
    // Get fresh token on each request
    const token = TokenManager.getAccessToken();

    if (!token) {
      toast({
        title: isRTL ? "غير مصرح لك" : "Not authorized",
        description: isRTL
          ? "يرجى تسجيل الدخول مرة أخرى"
          : "Please login again",
        variant: "destructive",
      });
      return;
    }

    const res = await fetch(
      `${VITE_API_BASE_URL}/api/advertising/${id}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) {

      toast({
        title: isRTL ? "تمت الموافقة على الإعلان" : "Ad approved successfully",
      });
      refetch();
    } else {
      const errorData = await res.json().catch(() => ({}));
  
      let errorMessage = isRTL
        ? "فشل في الموافقة على الإعلان"
        : "Failed to approve ad";

      if (res.status === 401) {
        errorMessage = isRTL ? "غير مصرح لك" : "Unauthorized access";
      } else if (res.status === 403) {
        errorMessage = isRTL ? "ليس لديك صلاحية" : "Insufficient permissions";
      } else if (res.status === 404) {
        errorMessage = isRTL ? "الإعلان غير موجود" : "Ad not found";
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }

      toast({
        title: errorMessage,
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: isRTL ? "خطأ في الشبكة" : "Network error",
      description:
        error instanceof Error
          ? error.message
          : isRTL
          ? "يرجى التحقق من الاتصال والمحاولة مرة أخرى"
          : "Please check your connection and try again",
      variant: "destructive",
    });
  }
};

export const handleReject = async (
  id: string,
  reason: string,
  isRTL: boolean,
  refetch: () => void
) => {
  try {
    // Get fresh token on each request
    const token = TokenManager.getAccessToken();

    if (!token) {
      toast({
        title: isRTL ? "غير مصرح لك" : "Not authorized",
        description: isRTL
          ? "يرجى تسجيل الدخول مرة أخرى"
          : "Please login again",
        variant: "destructive",
      });
      return;
    }

    const res = await fetch(
      `${VITE_API_BASE_URL}/api/advertising/${id}/reject`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (res.ok) {
      toast({
        title: isRTL ? "تم رفض الإعلان" : "Ad rejected successfully",
      });
      refetch();
    } else {
      const errorData = await res.json().catch(() => ({}));
      toast({
        title: isRTL ? "فشل في رفض الإعلان" : "Failed to reject ad",
        description: errorData.message || "",
        variant: "destructive",
      });
      let errorMessage = isRTL ? "فشل في رفض الإعلان" : "Failed to reject ad";

      if (res.status === 401) {
        errorMessage = isRTL ? "غير مصرح لك" : "Unauthorized access";
      } else if (res.status === 403) {
        errorMessage = isRTL ? "ليس لديك صلاحية" : "Insufficient permissions";
      } else if (res.status === 404) {
        errorMessage = isRTL ? "الإعلان غير موجود" : "Ad not found";
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }

      toast({
        title: errorMessage,
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: isRTL ? "خطأ في الشبكة" : "Network error",
      description:
      error instanceof Error
        ? error.message
        : isRTL
        ? "يرجى التحقق من الاتصال والمحاولة مرة أخرى"
        : "Please check your connection and try again",
      variant: "destructive",
    });
  }
};
