import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: RejectDialogProps) {
  const { t, isRTL } = useLanguage();
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason(""); // Reset after submission
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-[500px] ${isRTL ? "rtl" : "ltr"}`}>
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "سبب رفض الإعلان" : "Reject Ad Reason"}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? "الرجاء كتابة سبب رفض هذا الإعلان. هذا السبب سيتم إرساله إلى المعلن."
              : "Please provide a reason for rejecting this ad. This reason will be sent to the advertiser."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              {isRTL ? "سبب الرفض" : "Rejection Reason"}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isRTL
                  ? "اكتب سبب رفض الإعلان هنا..."
                  : "Write the rejection reason here..."
              }
              className="min-h-[120px] resize-none"
              dir={isRTL ? "rtl" : "ltr"}
              disabled={isLoading}
            />
            {reason.trim() === "" && (
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "سبب الرفض مطلوب"
                  : "Rejection reason is required"}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}>
            {isRTL ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mx-2"></i>
                {isRTL ? "جاري الرفض..." : "Rejecting..."}
              </>
            ) : (
              <>
                <i className="fas fa-times-circle mx-2"></i>
                {isRTL ? "رفض الإعلان" : "Reject Ad"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
