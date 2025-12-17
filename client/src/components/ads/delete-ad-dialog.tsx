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

export function DeleteAdDialog({ adId, open, onOpenChange }: DeleteAdDialogProps) {
  const { t } = useLanguage();
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
      queryClient.invalidateQueries({ queryKey: ["/api/ads/user"] });
      toast({
        title: t("ads", "deleteSuccess") || "تم حذف الإعلان بنجاح",
        description: t("ads", "deleteSuccessMessage") || "تم حذف الإعلان من قائمتك",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: t("ads", "deleteError") || "خطأ في الحذف",
        description: t("ads", "deleteErrorMessage") || "حدث خطأ أثناء حذف الإعلان",
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("ads", "deleteConfirmTitle") || "تأكيد الحذف"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("ads", "deleteConfirmMessage") ||
              "هل أنت متأكد من أنك تريد حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t("ads", "cancel") || "إلغاء"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteAdMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {deleteAdMutation.isPending
              ? t("ads", "deleting") || "جاري الحذف..."
              : t("ads", "delete") || "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
