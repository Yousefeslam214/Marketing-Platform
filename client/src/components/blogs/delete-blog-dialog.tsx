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

interface DeleteBlogDialogProps {
  blogId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBlogDialog({
  blogId,
  open,
  onOpenChange,
}: DeleteBlogDialogProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId: string) => {
      const response = await apiRequest(
        "DELETE",
        `${VITE_API_BASE_URL}/api/blogs/${blogId}`
      );
      return response.json();
    },
    onSuccess: () => {
      console.log('✅ Blog deleted successfully');
      queryClient.clear(); // Clear entire cache
      toast({
        title: "تم حذف المدونة بنجاح",
        description: "تم حذف المدونة وجميع البيانات المتعلقة بها",
      });
      onOpenChange(false);
      // Force full page reload to show updated data
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف المدونة",
        description: "حدث خطأ أثناء حذف المدونة. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleConfirmDelete = () => {
    if (blogId) {
      deleteBlogMutation.mutate(blogId);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} isRTL={isRTL}>
      <AlertDialogContent isRTL={isRTL}>
        <AlertDialogHeader isRTL={isRTL}>
          <AlertDialogTitle>تأكيد حذف المدونة</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من أنك تريد حذف هذه المدونة؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع التعليقات والإحصائيات المتعلقة بهذه المدونة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter isRTL={isRTL}>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteBlogMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {deleteBlogMutation.isPending
              ? "جاري الحذف..."
              : "حذف المدونة"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
