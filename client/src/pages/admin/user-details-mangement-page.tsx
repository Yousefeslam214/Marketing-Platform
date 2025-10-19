import { useParams, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface SocialMediaPage {
  pageId: string;
  pageName: string;
  pageType: string;
  isActive: boolean;
}

interface UserDetailsInterface {
  id: string;
  username: string;
  email: string;
  role: string;
  verified: boolean;
  freeViewsCredits: number;
  createdAt: string;
  adsCount: number;
  balance: number;
  totalSpend: number;
  socialMediaPages: SocialMediaPage[];
}

export default function UserDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [manualCredit, setManualCredit] = useState<string>("");
  const parsedCredit = Number(manualCredit);
  const isCreditValid =
    manualCredit !== "" && !isNaN(parsedCredit) && parsedCredit >= 1;

  const safeId = id ?? "";

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: [`/api/user/userDetails/${safeId}`, safeId],
    url: `${VITE_API_BASE_URL}/api/user/userDetails/${safeId}`,
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/users/${safeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("userDetails", "deleteSuccess"),
        description: t("userDetails", "userDeletedSuccessfully"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setLocation("/admin/users");
    },
    onError: (error) => {
      toast({
        title: t("userDetails", "deleteError"),
        description: error.message || t("userDetails", "failedToDeleteUser"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const promoteUserMutation = useMutation({
    mutationFn: async () => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(
        `${VITE_API_BASE_URL}/api/users/promote/${safeId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to promote user");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("userDetails", "promoteSuccess"),
        description: t("userDetails", "userPromotedSuccessfully"),
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: t("userDetails", "promoteError"),
        description: error.message || t("userDetails", "failedToPromoteUser"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsPromoting(false);
    },
  });

  const handleDeleteUser = () => {
    setIsDeleting(true);
    deleteUserMutation.mutate();
  };

  const handlePromoteUser = () => {
    setIsPromoting(true);
    promoteUserMutation.mutate();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "user":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusBadgeColor = (verified: boolean) => {
    return verified
      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
  };
  const user = userData?.data as UserDetailsInterface;

  const addCreditMutation = useMutation({
    mutationFn: async (credit: number) => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(
        `${VITE_API_BASE_URL}/api/users/addCredit/${safeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ credit }),
        }
      );
      const body = await res.json();
      if (!res.ok || (body && body.success === false)) {
        throw new Error(body?.message || "Failed to add credit");
      }
      queryClient.clear();
      return body;
    },
    onSuccess: (res: any) => {
      toast({
        title: t("userDetails", "creditAddedSuccess"),
        description: res?.message || t("userDetails", "creditAddedDesc"),
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setManualCredit("");
    },
    onError: (err: any) => {
      toast({
        title: t("userDetails", "creditAddFailed"),
        description: err.message || t("userDetails", "pleaseRetryLater"),
        variant: "destructive",
      });
    },
  });
  if (isLoading) {
    return (
      <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex-1 overflow-auto">
          <div className="text-center py-12">
            <p className="text-destructive">
              {t("userDetails", "errorLoadingUser")}
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              {t("userDetails", "retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("userDetails", "title")}
          description={t("userDetails", "description")}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setLocation("/admin/users")}
                data-testid="button-back-to-users">
                <i
                  className={`fas fa-arrow-left ${
                    isRTL ? "ml-2" : "mr-2"
                  }`}></i>
                {t("userDetails", "backToUsers")}
              </Button>
            </div>
          }
        />

        <main className="p-6 space-y-6">
          {/* User Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" alt={user.username} />
                  <AvatarFallback className="text-lg">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{user.username}</CardTitle>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusBadgeColor(user.verified)}>
                      {user.verified
                        ? t("userDetails", "verified")
                        : t("userDetails", "unverified")}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.role !== "admin" && (
                    <Button
                      onClick={handlePromoteUser}
                      disabled={isPromoting}
                      variant="default">
                      <i
                        className={`fas fa-user-shield ${
                          isRTL ? "ml-2" : "mr-2"
                        }`}></i>
                      {isPromoting
                        ? t("userDetails", "promoting")
                        : t("userDetails", "promoteToAdmin")}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={isDeleting}
                        data-testid="button-delete-user">
                        <i
                          className={`fas fa-trash ${
                            isRTL ? "ml-2" : "mr-2"
                          }`}></i>
                        {isDeleting
                          ? t("userDetails", "deleting")
                          : t("userDetails", "deleteUser")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("userDetails", "confirmDelete")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("userDetails", "deleteConfirmDescription").replace(
                            "{username}",
                            user.username
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("userDetails", "cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteUser}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t("userDetails", "confirmDeleteButton")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-sar-sign text-green-600"></i>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-saudi-riyal-icon lucide-saudi-riyal">
                      <path d="m20 19.5-5.5 1.2" />
                      <path d="M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2" />
                      <path d="m2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2" />
                      <path d="M20 10 4 13.5" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("userDetails", "balance")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {user.balance.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bullhorn text-purple-600"></i>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("userDetails", "adsCount")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {user.adsCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-orange-600"></i>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("userDetails", "totalSpend")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${user.totalSpend.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("userDetails", "accountInformation")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("userDetails", "userId")}
                  </p>
                  <p className="font-medium text-foreground">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("userDetails", "createdAt")}
                  </p>
                  <p className="font-medium text-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("userDetails", "email")}
                  </p>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("userDetails", "role")}
                  </p>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("userDetails", "addCredit")}</CardTitle>
            </CardHeader>

            <CardContent>
              <div>
                {/* Admin manual credit top-up */}

                <div className="md:col-span-2">
                  <h4 className="text-sm text-muted-foreground mb-2">
                    {t("userDetails", "manualCredit")}
                  </h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label htmlFor="manual-credit" className="sr-only">
                      {t("userDetails", "enterCredit")}
                    </label>
                    <Input
                      id="manual-credit"
                      type="number"
                      min={1}
                      placeholder={t("userDetails", "enterCredit")}
                      value={manualCredit}
                      onChange={(e) => setManualCredit(e.target.value)}
                      className="w-full sm:w-48"
                      disabled={addCreditMutation.isPending}
                      aria-label={t("userDetails", "enterCredit")}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={
                            addCreditMutation.isPending || !isCreditValid
                          }
                          className="whitespace-nowrap">
                          {addCreditMutation.isPending
                            ? t("userDetails", "processing")
                            : t("userDetails", "addCredit")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("userDetails", "confirmCreditTitle")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("userDetails", "confirmCreditDescription")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t("userDetails", "cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              addCreditMutation.mutate(parsedCredit)
                            }
                            disabled={!isCreditValid}
                            className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {t("userDetails", "confirmAddCredit")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Helper & validation */}
                  <div className="mt-3">
                    {manualCredit && Number(manualCredit) < 1 && (
                      <p className="text-sm text-destructive">
                        {t("userDetails", "creditMustBePositive")}
                      </p>
                    )}
                    {manualCredit && Number(manualCredit) >= 1 && (
                      <p className="text-sm text-muted-foreground">
                        {t("userDetails", "willAddCredits")?.replace(
                          "{amount}",
                          `${manualCredit}`
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Pages */}
          {user.socialMediaPages && user.socialMediaPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("userDetails", "socialMediaPages")}</CardTitle>
              </CardHeader>{" "}
              <CardContent>
                <div className="space-y-4">
                  {user.socialMediaPages.map((page) => (
                    <div
                      key={page.pageId}
                      className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fab fa-facebook text-blue-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {page.pageName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {page.pageType} • ID: {page.pageId}
                          </p>
                        </div>
                      </div>

                      <Badge
                        className={
                          page.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                        }>
                        {page.isActive
                          ? t("userDetails", "active")
                          : t("userDetails", "inactive")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
