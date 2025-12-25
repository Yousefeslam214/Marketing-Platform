import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blogs/blog-card";
import { Blog } from "@shared/schema";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";
import { DeleteBlogDialog } from "@/components/blogs/delete-blog-dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AllBlogs() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("5");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  const handleDeleteBlog = (blogId: string) => {
    setBlogToDelete(blogId);
    setDeleteDialogOpen(true);
  };

  const handlePublishBlog = async (blogId: string) => {
    try {
      console.log("Publishing blog:", blogId);

      const response = await apiRequest(
        "PATCH",
        `${VITE_API_BASE_URL}/api/blogs/${blogId}`,
        {
          status: "published"
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish blog');
      }

      console.log("✅ Blog published successfully");
      queryClient.clear();
      toast({
        title: "تم نشر المدونة بنجاح",
        description: "تم نشر المدونة وهي الآن متاحة للعرض",
      });

      // Force page reload to show updated data
      window.location.reload();
    } catch (error) {
      console.error("❌ Publish error:", error);
      toast({
        title: "خطأ في النشر",
        description: "حدث خطأ أثناء نشر المدونة",
        variant: "destructive",
      });
    }
  };

  const handleArchiveBlog = async (blogId: string) => {
    try {
      console.log("Archiving blog:", blogId);

      const response = await apiRequest(
        "PATCH",
        `${VITE_API_BASE_URL}/api/blogs/${blogId}`,
        {
          status: "archived"
        }
      );

      if (!response.ok) {
        throw new Error('Failed to archive blog');
      }

      console.log("✅ Blog archived successfully");
      queryClient.clear(); // Clear entire cache
      toast({
        title: "تم أرشفة المدونة بنجاح",
        description: "تم أرشفة المدونة وهي الآن غير متاحة للعرض",
      });

      // Force full page reload to show updated data
      window.location.reload();
    } catch (error) {
      console.error("❌ Archive error:", error);
      toast({
        title: "خطأ في الأرشفة",
        description: "حدث خطأ أثناء أرشفة المدونة",
        variant: "destructive",
      });
    }
  };

  const {
    data: blogs,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/blogs/all", page, limit],
    url: `${VITE_API_BASE_URL}/api/blogs?page=${page}&limit=${limit}`,
  });


  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  if (TokenManager.getRole() !== "admin") {
    setLocation("/");
    return null;
  }

  // Get all blogs from response
  const allBlogs = Array.isArray(blogs?.data) ? (blogs?.data as Blog[]) : [];

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title="جميع المدونات"
          description="إدارة جميع المدونات في النظام"
          actions={
            <div className="flex items-center gap-2">
              <Button onClick={() => setLocation("/blogs/create")}>
                <i className="fas fa-plus mx-2"></i>
                إنشاء مدونة جديدة
              </Button>
            </div>
          }
        />
        <main className="p-6 mt-24">
          {isLoading ? (
            <div className="min-h-[74vh] ">
              <Loading />
            </div>
          ) : error ? (
            <div className="min-h-[74vh] mt-24">
              <ErrorState
                title="فشل في تحميل المدونات"
                message={(error as Error)?.message || "يرجى المحاولة مرة أخرى لاحقاً."}
                onRetry={() => refetch()}
                showHomeButton
                onHome={() => (window.location.href = "/")}
              />
            </div>
          ) : allBlogs.length > 0 ? (
            <div className="min-h-[74vh]">
              <div className="flex flex-col w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {allBlogs.map((blog: Blog) => (
                    <div key={blog._id} className="relative">
                      <BlogCard
                        blog={blog}
                        language={isRTL ? "ar" : "en"}
                        onView={(id) => setLocation(`/blogs/${id}`)}
                        onEdit={(id) => setLocation(`/blogs/${id}/edit`)}
                        onDelete={handleDeleteBlog}
                        onPublish={handlePublishBlog}
                        onArchive={handleArchiveBlog}
                        showActions={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8">
                  <DataPagination
                    pagination={blogs?.pagination as any || {
                      currentPage: parseInt(page),
                      totalPages: 1,
                      totalItems: allBlogs.length,
                      hasPrevious: parseInt(page) > 1,
                      hasNext: false,
                      itemsPerPage: parseInt(limit),
                      limit: parseInt(limit)
                    }}
                    onPageChange={(newPage) => setPage(newPage)}
                    pageSize={limit}
                    onPageSizeChange={(newLimit) => setLimit(newLimit)}
                    showPageSizeSelector={true}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[74vh] flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-blog text-6xl text-muted-foreground mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">لا توجد مدونات</h3>
                <p className="text-muted-foreground mb-4">
                  لم يتم العثور على أي مدونات في النظام.
                </p>
                <Button onClick={() => setLocation("/blogs/create")}>
                  <i className="fas fa-plus mx-2"></i>
                  إنشاء أول مدونة
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <DeleteBlogDialog
        blogId={blogToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
