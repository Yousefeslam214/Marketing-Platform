import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const limit = 5;
  const [page, setPage] = useState(1);
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/api/users", page, limit],
    url: `${VITE_API_BASE_URL}/api/users?page=${page}&limit=${limit}`,
  });

  // const mockUsers = usersData;
  console.log("Fetched users:", usersData?.data);
  const mockUsers = usersData?.data;
  // Check admin access
  // if (!isAuthenticated || user?.role !== "admin") {
  //   setLocation("/dashboard");
  //   return null;
  // }

  interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    freeViewsCredits: number;
    createdAt: string;
    adsCount: number;
    totalSpend: number;
  }

  const filteredUsers = (mockUsers as User[] | undefined)?.filter(
    (user: User) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    }
  );

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
  if (isLoading) return <Loading />;
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

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("userManagement", "title")}
          description={t("userManagement", "description")}
        />

        <main className="p-6">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-sm">
              <Input
                type="search"
                placeholder={t("userManagement", "searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger
                className="w-[180px]"
                data-testid="select-role-filter">
                <SelectValue
                  placeholder={t("userManagement", "filterByRole")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("userManagement", "allRoles")}
                </SelectItem>
                <SelectItem value="advertiser">
                  {t("userManagement", "advertisers")}
                </SelectItem>
                <SelectItem value="marketing">
                  {t("userManagement", "marketing")}
                </SelectItem>
                <SelectItem value="admin">
                  {t("userManagement", "admins")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Grid */}
          {isLoading ? (
            <Loading />
          ) : (
            filteredUsers &&
            filteredUsers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUsers.map((userData) => (
                  <Card key={userData.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" alt={userData.username} />
                          <AvatarFallback>
                            {userData.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle
                            className="text-base truncate"
                            data-testid={`user-name-${userData.id}`}>
                            {userData.username}
                          </CardTitle>
                          <p
                            className="text-sm text-muted-foreground truncate"
                            data-testid={`user-email-${userData.id}`}>
                            {userData.email}
                          </p>
                        </div>
                        <Badge className={getRoleBadgeColor(userData.role)}>
                          {userData.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            {t("userManagement", "credits")}
                          </p>
                          <p
                            className="font-medium"
                            data-testid={`user-credits-${userData.id}`}>
                            {userData.freeViewsCredits.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {t("userManagement", "ads")}
                          </p>
                          <p
                            className="font-medium"
                            data-testid={`user-ads-count-${userData.id}`}>
                            {userData.adsCount}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            {t("userManagement", "totalSpend")}
                          </p>
                          <p
                            className="font-medium"
                            data-testid={`user-spend-${userData.id}`}>
                            ${userData.totalSpend.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {t("userManagement", "joined")}
                          </p>
                          <p
                            className="font-medium"
                            data-testid={`user-joined-${userData.id}`}>
                            {new Date(userData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setLocation(`/admin/users/${userData.id}`)
                          }
                          data-testid={`button-view-user-${userData.id}`}>
                          <i className="fas fa-eye mr-1"></i>
                          {t("userManagement", "view")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-user-${userData.id}`}>
                          <i className="fas fa-edit mr-1"></i>
                          {t("userManagement", "edit")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {filteredUsers?.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-users text-6xl text-muted-foreground mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t("userManagement", "noUsersFound")}
              </h3>
              <p className="text-muted-foreground">
                {t("userManagement", "adjustSearch")}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
