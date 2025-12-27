import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blogs/blog-card";
import { Blog } from "@shared/schema";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useCallback } from "react";

export default function BlogsPage() {
  const [location, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("9");
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("all");
  const [blogsList, setBlogsList] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  // Function to fetch blogs data - completely fresh
  const fetchBlogsData = useCallback(
    async (forceRefresh = false) => {
      try {
        setIsLoading(true);
        setError(null);

        // Clear existing data immediately when force refreshing
        if (forceRefresh) {
          setBlogsList([]);
          setPagination(null);
        }

        const params = new URLSearchParams({
          page,
          limit,
          t: Date.now().toString(),
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const url =
          category === "all"
            ? `${VITE_API_BASE_URL}/api/blogs/published?${params.toString()}`
            : `${VITE_API_BASE_URL}/api/blogs/category/${encodeURIComponent(
                category
              )}?${params.toString()}`;

        console.log("🔄 Fetching fresh blogs data from:", url);

        const response = await apiRequest("GET", url);

        if (!response.ok) {
          throw new Error("Failed to fetch blogs data");
        }

        const data = await response.json();
        const newBlogsList = Array.isArray(data.data) ? data.data : [];

        console.log(
          "✅ Received fresh blogs data:",
          newBlogsList.length,
          "blogs"
        );

        setBlogsList(newBlogsList);
        setPagination(data.pagination);
      } catch (err) {
        console.error("❌ Error fetching blogs data:", err);
        setError(err as Error);
        // Clear data on error
        setBlogsList([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, category, search]
  );

  // Fetch blogs data on mount and when dependencies change
  useEffect(() => {
    fetchBlogsData();
  }, [fetchBlogsData]);

  // Refresh data when window regains focus or visibility changes (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 Window focused - force refreshing blogs data");
      fetchBlogsData(true); // Force refresh
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Page became visible - force refreshing blogs data");
        fetchBlogsData(true); // Force refresh
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchBlogsData]);

  // Also refresh on navigation/history changes (when user navigates back)
  useEffect(() => {
    const handleNavigation = () => {
      console.log("🔄 Navigation detected - force refreshing blogs data");
      fetchBlogsData(true);
    };

    // Listen for navigation events
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [fetchBlogsData]);

  // Refresh when location changes to this page (user navigates back)
  useEffect(() => {
    if (location === "/blogs") {
      console.log("🔄 Navigated back to blogs page - force refreshing");
      fetchBlogsData(true);
    }
  }, [location, fetchBlogsData]);

  // Get unique categories from blogs in the active language
  const categories = blogsList
    .map((blog) =>
      isRTL
        ? blog.category?.ar || blog.category?.en
        : blog.category?.en || blog.category?.ar
    )
    .filter((value, index, self) => value && self.indexOf(value) === index);

  const hasFilters = search.trim() || category !== "all";

  const handleViewBlog = (blogId: string) => {
    setLocation(`/blogs/${blogId}`);
  };

  // Manual refresh function
  const refreshBlogs = () => {
    console.log("🔄 Manual refresh triggered");
    fetchBlogsData(true);
  };

  return (
    <div className={`flex bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 ">
        <Header
          title={t("blogsPage", "title")}
          description={t("blogsPage", "description")}
          actions={
            <>
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <Input
                    placeholder={t("blogsPage", "searchPlaceholder")}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage("1");
                    }}
                    className="w-full"
                  />
                </div>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value);
                    setPage("1");
                  }}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={t("blogsPage", "allCategories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("blogsPage", "allCategories")}
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setPage("1");
                }}>
                <i className="fas fa-times mx-2"></i>
                {t("blogsPage", "clearFilters")}
              </Button>
              <Button
                variant="outline"
                onClick={refreshBlogs}
                disabled={isLoading}>
                <i className="fas fa-sync-alt mx-2"></i>
                {t("blogsPage", "refresh")}
              </Button>
            </>
          }
        />
       
        {/* Hero Section */}
        <section className="relative pt-20 pb-10 w-full flex flex-col items-center bg-gradient-to-b from-primary/5 via-background to-background px-4 sm:px-6">
          {/* <main className="p-6 mt-24"> */}
          {/* Search and Filter Section */}

          {isLoading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <Loading />
            </div>
          ) : error ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <ErrorState
                title={t("blogsPage", "loadFailedTitle")}
                message={
                  error?.message || t("blogsPage", "loadFailedMessage")
                }
                onRetry={() => window.location.reload()}
              />
            </div>
          ) : blogsList.length > 0 ? (
            <div className="w-full max-w-7xl mx-auto min-h-[78vh] mt-12 px-2 sm:px-4 flex flex-col justify-between
            ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {blogsList.map((blog: Blog) => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    language={isRTL ? "ar" : "en"}
                    onView={handleViewBlog}
                    showActions={false}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <DataPagination
                  pagination={
                    pagination || {
                      currentPage: parseInt(page),
                      totalPages: 1,
                      totalItems: 0,
                      hasPrevious: false,
                      hasNext: false,
                      itemsPerPage: parseInt(limit),
                    }
                  }
                  onPageChange={(newPage) => setPage(newPage)}
                  pageSize={limit}
                  onPageSizeChange={(newLimit: string) => setLimit(newLimit)}
                  showPageSizeSelector={true}
                />
              </div>
            </div>
          ) : (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-blog text-6xl text-muted-foreground mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">
                  {hasFilters
                    ? t("blogsPage", "noResultsTitle")
                    : t("blogsPage", "emptyTitle")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {hasFilters
                    ? t("blogsPage", "noResultsMessage")
                    : t("blogsPage", "emptyMessage")}
                </p>
                {hasFilters && (
                  <Button
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                    }}>
                    <i className="fas fa-times mx-2"></i>
                    {t("blogsPage", "clearSearch")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
