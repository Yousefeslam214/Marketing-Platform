import { useParams } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";

export default function AdminUserDetail() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: [`/api/users/${id}`],
    url: `${VITE_API_BASE_URL}/api/users/${id}`,
  });

  if (isLoading) {
    return <Loading/>
  }

  if (error) {
      return (
        <div className="flex flex-center justify-center h-screen bg-background">
          <ErrorState
            title="Failed to load Users"
            message={(error as Error)?.message || "Please try again later."}
            onRetry={() => refetch()}
            showHomeButton
            onHome={() => (window.location.href = "/")} // or use your router
          />
        </div>
      );
    }
  const user = userData.data;

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

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title={t("userDetails", "User Details")}
        description={t("userDetails", "Detailed view of user profile")}
      />

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="" alt={user.username} />
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.username}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Verified</p>
              <p className="font-medium">{user.verified ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Credits</p>
              <p className="font-medium">
                {user.freeViewsCredits.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Ads Count</p>
              <p className="font-medium">{user.adsCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Spend</p>
              <p className="font-medium">${user.totalSpend.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.socialMediaPages?.length > 0 ? (
              user.socialMediaPages.map((page: any) => (
                <div
                  key={page.pageId}
                  className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{page.pageName}</p>
                    <p className="text-sm text-muted-foreground">
                      {page.pageType}
                    </p>
                  </div>
                  <Badge
                    className={
                      page.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                    }>
                    {page.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No connected pages</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline">
            <i className="fas fa-edit mr-2"></i>Edit User
          </Button>
          <Button variant="destructive">
            <i className="fas fa-trash mr-2"></i>Delete User
          </Button>
        </div>
      </main>
    </div>
  );
}
