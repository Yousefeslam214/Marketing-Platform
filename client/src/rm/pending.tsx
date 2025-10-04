import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { TokenManager } from "@/lib/auth";

export default function AdminPending() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const { data: pendingAds, isLoading } = useQuery({
    queryKey: ["/admin/pending"],
    enabled: !!TokenManager.getAccessToken(),
  });

  // Type-safe pending ads array
  const safePendingAds = (pendingAds as any[]) || [];

  const approveMutation = useMutation({
    mutationFn: async (adId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/ads/${adId}/approve`
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads/pending"] });
      toast({
        title: "Ad approved",
        description: "The ad has been approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval failed",
        description: error.message || "Failed to approve ad",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ adId, reason }: { adId: string; reason: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/ads/${adId}/reject`,
        {
          action: "reject",
          reason,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads/pending"] });
      setSelectedAdId(null);
      setRejectionReason("");
      toast({
        title: "Ad rejected",
        description: "The ad has been rejected",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection failed",
        description: error.message || "Failed to reject ad",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (adId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/ads/${adId}/publish`
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads/pending"] });
      toast({
        title: "Ad published",
        description: "The ad has been published successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Publishing failed",
        description: error.message || "Failed to publish ad",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (adId: string) => {
    approveMutation.mutate(adId);
  };

  const handleReject = () => {
    if (selectedAdId && rejectionReason.trim()) {
      rejectMutation.mutate({ adId: selectedAdId, reason: rejectionReason });
    }
  };

  const handlePublish = (adId: string) => {
    publishMutation.mutate(adId);
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("pending", "title")}
          description={t("pending", "description")}
        />

        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : safePendingAds.length > 0 ? (
            <div className="space-y-6">
              {safePendingAds.map((ad: any) => (
                <Card key={ad.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {ad.titleEn}
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-700">
                            Pending Review
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted{" "}
                          {new Date(ad.createdAt).toLocaleDateString()} by{" "}
                          {ad.user?.username}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Ad Content */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            English Content
                          </h4>
                          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <h5
                              className="font-medium text-foreground"
                              data-testid={`ad-title-en-${ad.id}`}>
                              {ad.titleEn}
                            </h5>
                            <p
                              className="text-sm text-muted-foreground"
                              data-testid={`ad-description-en-${ad.id}`}>
                              {ad.descriptionEn}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Arabic Content
                          </h4>
                          <div
                            className="p-4 bg-muted/50 rounded-lg space-y-2"
                            dir="rtl">
                            <h5
                              className="font-medium text-foreground"
                              data-testid={`ad-title-ar-${ad.id}`}>
                              {ad.titleAr}
                            </h5>
                            <p
                              className="text-sm text-muted-foreground"
                              data-testid={`ad-description-ar-${ad.id}`}>
                              {ad.descriptionAr}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ad Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Target Audience
                            </h4>
                            <p
                              className="text-sm text-foreground capitalize"
                              data-testid={`ad-audience-${ad.id}`}>
                              {ad.targetAudience}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Budget Type
                            </h4>
                            <p
                              className="text-sm text-foreground capitalize"
                              data-testid={`ad-budget-${ad.id}`}>
                              {ad.budgetType}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Target URL
                          </h4>
                          <a
                            href={ad.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm break-all"
                            data-testid={`ad-url-${ad.id}`}>
                            {ad.targetUrl}
                          </a>
                        </div>

                        {ad.imageUrl && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                              Ad Image
                            </h4>
                            <img
                              src={ad.imageUrl}
                              alt={ad.titleEn}
                              className="w-full max-w-xs rounded-lg border"
                              data-testid={`ad-image-${ad.id}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedAdId(ad.id)}
                            data-testid={`button-reject-${ad.id}`}>
                            <i className="fas fa-times mr-2"></i>
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Ad</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting this ad.
                              This will help the advertiser improve their
                              submission.
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="min-h-[100px]"
                            data-testid="textarea-rejection-reason"
                          />
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedAdId(null);
                                setRejectionReason("");
                              }}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleReject}
                              disabled={
                                !rejectionReason.trim() ||
                                rejectMutation.isPending
                              }
                              data-testid="button-confirm-reject">
                              {rejectMutation.isPending ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-2"></i>
                                  Rejecting...
                                </>
                              ) : (
                                "Reject Ad"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        onClick={() => handleApprove(ad.id)}
                        disabled={approveMutation.isPending}
                        data-testid={`button-approve-${ad.id}`}>
                        {approveMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Approving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check mr-2"></i>
                            Approve
                          </>
                        )}
                      </Button>

                      {ad.status === "approved" && (
                        <Button
                          onClick={() => handlePublish(ad.id)}
                          disabled={publishMutation.isPending}
                          data-testid={`button-publish-${ad.id}`}>
                          {publishMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Publishing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-share-alt mr-2"></i>
                              Publish
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-clock text-6xl text-muted-foreground mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No pending ads
              </h3>
              <p className="text-muted-foreground">
                All submitted ads have been reviewed
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
