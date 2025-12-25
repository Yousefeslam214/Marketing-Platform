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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const fetchBlogsData = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear existing data immediately when force refreshing
      if (forceRefresh) {
        setBlogsList([]);
        setPagination(null);
      }

      const url = category === "all"
        ? `${VITE_API_BASE_URL}/api/blogs/published?page=${page}&limit=${limit}&t=${Date.now()}`
        : `${VITE_API_BASE_URL}/api/blogs/category/${category}?page=${page}&limit=${limit}&t=${Date.now()}`;

      console.log('🔄 Fetching fresh blogs data from:', url);

      const response = await apiRequest("GET", url);

      if (!response.ok) {
        throw new Error('Failed to fetch blogs data');
      }

      const data = await response.json();
      const newBlogsList = Array.isArray(data.data) ? data.data : [];

      console.log('✅ Received fresh blogs data:', newBlogsList.length, 'blogs');

      setBlogsList(newBlogsList);
      setPagination(data.pagination);
    } catch (err) {
      console.error('❌ Error fetching blogs data:', err);
      setError(err as Error);
      // Clear data on error
      setBlogsList([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, category]);

  // Fetch blogs data on mount and when dependencies change
  useEffect(() => {
    fetchBlogsData();
  }, [fetchBlogsData]);

  // Refresh data when window regains focus or visibility changes (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused - force refreshing blogs data');
      fetchBlogsData(true); // Force refresh
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible - force refreshing blogs data');
        fetchBlogsData(true); // Force refresh
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchBlogsData]);

  // Also refresh on navigation/history changes (when user navigates back)
  useEffect(() => {
    const handleNavigation = () => {
      console.log('🔄 Navigation detected - force refreshing blogs data');
      fetchBlogsData(true);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [fetchBlogsData]);

  // Refresh when location changes to this page (user navigates back)
  useEffect(() => {
    if (location === '/blogs') {
      console.log('🔄 Navigated back to blogs page - force refreshing');
      fetchBlogsData(true);
    }
  }, [location, fetchBlogsData]);

  // Get unique categories from blogs
  const categories = blogsList
    .map(blog => blog.category?.en || blog.category?.ar)
    .filter((value, index, self) => value && self.indexOf(value) === index);

  const handleViewBlog = (blogId: string) => {
    setLocation(`/blogs/${blogId}`);
  };

  // Manual refresh function
  const refreshBlogs = () => {
    console.log('🔄 Manual refresh triggered');
    fetchBlogsData(true);
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <Header
        title="المدونة"
        description="استكشف أحدث المقالات والمحتوى المفيد"
      />

      <main className="p-6 mt-24">
        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-6 rounded-lg border">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <Input
                  placeholder="البحث في المدونات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
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
              }}
            >
              <i className="fas fa-times mx-2"></i>
              مسح
            </Button>
            <Button
              variant="outline"
              onClick={refreshBlogs}
              disabled={isLoading}
            >
              <i className="fas fa-sync-alt mx-2"></i>
              تحديث
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <ErrorState
              title="فشل في تحميل المدونات"
              message={error?.message || "يرجى المحاولة مرة أخرى لاحقاً."}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : blogsList.length > 0 ? (
          <div className="max-w-7xl mx-auto">
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
                pagination={pagination || {
                  currentPage: parseInt(page),
                  totalPages: 1,
                  totalItems: 0,
                  hasPrevious: false,
                  hasNext: false,
                  itemsPerPage: parseInt(limit),
                }}
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
                {search || category !== "all" ? "لا توجد نتائج" : "لا توجد مدونات"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {search || category !== "all"
                  ? "لم يتم العثور على مدونات تطابق معايير البحث."
                  : "لم يتم العثور على أي مدونات منشورة في النظام."
                }
              </p>
              {(search || category !== "all") && (
                <Button
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                  }}
                >
                  <i className="fas fa-times mx-2"></i>
                  مسح البحث
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
