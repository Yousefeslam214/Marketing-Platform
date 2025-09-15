import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function AdminUsers() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Check admin access
  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  // Mock data for users - in real app this would come from API
  const mockUsers = [
    {
      id: "1",
      username: "ahmed_rashid",
      email: "ahmed@example.com",
      role: "advertiser",
      freeViewsCredits: 8500,
      createdAt: "2024-01-15T10:00:00Z",
      adsCount: 5,
      totalSpend: 2847
    },
    {
      id: "2",
      username: "sara_marketing",
      email: "sara@boltads.com",
      role: "marketing",
      freeViewsCredits: 10000,
      createdAt: "2024-01-10T09:30:00Z",
      adsCount: 0,
      totalSpend: 0
    },
    {
      id: "3",
      username: "admin_user",
      email: "admin@boltads.com",
      role: "admin",
      freeViewsCredits: 10000,
      createdAt: "2024-01-01T08:00:00Z",
      adsCount: 0,
      totalSpend: 0
    },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "marketing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "advertiser":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <Header
          title="User Management"
          description="Manage platform users and their permissions"
        />

        <main className="p-6">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-sm">
              <Input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-role-filter">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="advertiser">Advertisers</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <CardTitle className="text-base truncate" data-testid={`user-name-${userData.id}`}>
                        {userData.username}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate" data-testid={`user-email-${userData.id}`}>
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
                      <p className="text-muted-foreground">Credits</p>
                      <p className="font-medium" data-testid={`user-credits-${userData.id}`}>
                        {userData.freeViewsCredits.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ads</p>
                      <p className="font-medium" data-testid={`user-ads-count-${userData.id}`}>
                        {userData.adsCount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Spend</p>
                      <p className="font-medium" data-testid={`user-spend-${userData.id}`}>
                        ${userData.totalSpend.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium" data-testid={`user-joined-${userData.id}`}>
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-view-user-${userData.id}`}
                    >
                      <i className="fas fa-eye mr-1"></i>
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-edit-user-${userData.id}`}
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-users text-6xl text-muted-foreground mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
