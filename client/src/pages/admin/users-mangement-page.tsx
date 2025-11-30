import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
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
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";

export default function AdminUsers() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("5");

  // Adjust limit based on search - show more results when searching
  const effectiveLimit = searchQuery ? 20 : Number(limit);

  // Reset page when search query or filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage("1"); // Reset to first page when searching
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage("1"); // Reset to first page when filtering
    setLimit("200"); // Reset limit to default when filtering
  };

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/api/users", page, effectiveLimit],
    url: `${VITE_API_BASE_URL}/api/users?page=${page}&limit=${effectiveLimit}`,
  });


  // const mockUsers = usersData;

  const mockUsers = usersData?.data;
  console.log("mockUsers:", mockUsers);
  // Show loading indicator while fetching users
  if (isLoading) {
    return (
      <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex-1 overflow-auto">
          <Header
            title={t("userManagement", "title")}
            description={t("userManagement", "description")}
          />

          <main className="p-6">
            <Loading />
          </main>
        </div>
      </div>
    );
  }

  // Show error state when API call fails
  if (error) {
    const getErrorMessage = (err: unknown) => {
      if (!err) return "An unexpected error has occurred.";
      if (typeof err === "string") return err;
      if (err instanceof Error) return err.message;
      try {
        return JSON.stringify(err);
      } catch {
        return "An unexpected error has occurred.";
      }
    };

    return (
      <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex-1 overflow-auto">
          <Header
            title={t("userManagement", "title")}
            description={t("userManagement", "description")}
          />

          <main className="p-6">
            <ErrorState
              message={getErrorMessage(error)}
              onRetry={() => refetch && refetch()}
              showHomeButton={true}
              onHome={() => setLocation("/dashboard")}
            />
          </main>
        </div>
      </div>
    );
  }
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
        user?.username?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchQuery?.toLowerCase());
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
                placeholder={t("userManagement", "searchUsers")}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
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
                <SelectItem value="user">
                  {t("userManagement", "users")}
                </SelectItem>
                <SelectItem value="admin">
                  {t("userManagement", "admin")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("userManagement", "pageSize")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">
                  5 {t("userManagement", "perPage")}
                </SelectItem>
                <SelectItem value="10">
                  10 {t("userManagement", "perPage")}
                </SelectItem>
                <SelectItem value="20">
                  20 {t("userManagement", "perPage")}
                </SelectItem>
                <SelectItem value="50">
                  50 {t("userManagement", "perPage")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredUsers?.map((userData) => (
              <Card key={userData.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" alt={userData.username} />
                      <AvatarFallback>
                        {userData.username?.slice(0, 2).toUpperCase() || userData.email?.slice(0, 2).toUpperCase() }
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
                        <div className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
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
                          {userData.totalSpend.toLocaleString()}
                        </div>
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
                        setLocation(`/admin/user-details/${userData.id}`)
                      }
                      data-testid={`button-view-user-${userData.id}`}>
                      <i className="fas fa-eye mx-1"></i>
                      {t("userManagement", "view")}
                    </Button>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-edit-user-${userData.id}`}>
                      <i className="fas fa-edit mx-1"></i>
                      Edit
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {usersData?.pagination && !searchQuery && (
            <DataPagination
              pagination={usersData.pagination}
              currentPage={page}
              onPageChange={setPage}
              pageSize={limit}
              onPageSizeChange={setLimit}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 20, 50]}
              showInfo={true}
              className="mt-6"
            />
          )}

          {filteredUsers?.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-users text-6xl text-muted-foreground mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t("userManagement", "noUsersFound")}
              </h3>
              <p className="text-muted-foreground">
                {t("userManagement", "tryAdjusting")}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
