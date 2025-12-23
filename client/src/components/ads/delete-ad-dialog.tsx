import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteAdDialogProps {
  adId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAdDialog({
  adId,
  open,
  onOpenChange,
}: DeleteAdDialogProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteAdMutation = useMutation({
    mutationFn: async (adId: string) => {
      const response = await apiRequest(
        "DELETE",
        `${VITE_API_BASE_URL}/api/advertising/${adId}`
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all queries that depend on ads data
      queryClient.invalidateQueries({ queryKey: ["/api/ads/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment/history"] });
      // Invalidate analytics for the deleted ad if it exists
      if (adId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/users/ad/${adId}/analytics-full-details`],
        });
      }

      toast({
        title: t("ads", "deleteSuccess"),
        description: t("ads", "deleteSuccessMessage"),
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: t("ads", "deleteError"),
        description: t("ads", "deleteErrorMessage"),
        variant: "destructive",
      });
    },
  });

  const handleConfirmDelete = () => {
    if (adId) {
      deleteAdMutation.mutate(adId);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} isRTL={isRTL}>
      <AlertDialogContent isRTL={isRTL}>
        <AlertDialogHeader isRTL={isRTL}>
          <AlertDialogTitle>{t("ads", "deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("ads", "deleteConfirmMessage")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter isRTL={isRTL}>
          <AlertDialogCancel>{t("ads", "cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteAdMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {deleteAdMutation.isPending
              ? t("ads", "deleting")
              : t("ads", "delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
