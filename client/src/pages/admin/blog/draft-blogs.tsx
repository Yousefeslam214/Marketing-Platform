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

export default function DraftBlogs() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("5");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  const handleDeleteBlog = (blogId: string) => {
    setBlogToDelete(blogId);
    setDeleteDialogOpen(true);
  };

  const handlePublishBlog = async (blogId: string) => {
    // This will be handled by the BlogCard component
    console.log("Publishing blog:", blogId);
  };

  const {
    data: blogs,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/blogs/draft", page, limit],
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

  // Get all blogs and filter for drafts
  const allBlogs = Array.isArray(blogs?.data) ? (blogs?.data as Blog[]) : [];
  const draftBlogs = allBlogs.filter((blog) => blog.status === "draft");

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title="مسودات المدونات"
          description="إدارة مسودات المدونات التي لم يتم نشرها بعد"
          actions={
            <div className="flex items-center gap-2">
              <Button onClick={() => setLocation("/blogs/create")}>
                <i className="fas fa-plus mx-2"></i>
                إنشاء مدونة جديدة
              </Button>
            </div>
          }
        />
        <div className="p-6 mt-24">
          {isLoading ? (
            <div className="min-h-[74vh] ">
              <Loading />
            </div>
          ) : error ? (
            <div className="min-h-[74vh] mt-24">
              <ErrorState
                title="فشل في تحميل مسودات المدونات"
                message={
                  (error as Error)?.message || "يرجى المحاولة مرة أخرى لاحقاً."
                }
                onRetry={() => refetch()}
                showHomeButton
                onHome={() => (window.location.href = "/")}
              />
            </div>
          ) : draftBlogs.length > 0 ? (
            <div className="">
              <div className="flex flex-col w-full max-w-7xl mx-auto min-h-[80vh] justify-between">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {draftBlogs.map((blog: Blog) => (
                    <div key={blog._id} className="relative">
                      <BlogCard
                        blog={blog}
                        language={isRTL ? "ar" : "en"}
                        onView={(id) => setLocation(`/blogs/${id}`)}
                        onEdit={(id) => setLocation(`/blogs/${id}/edit`)}
                        onDelete={handleDeleteBlog}
                        onPublish={handlePublishBlog}
                        showActions={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8">
                  <DataPagination
                    pagination={
                      (blogs?.pagination as any) || {
                        currentPage: parseInt(page),
                        totalPages: 1,
                        totalItems: draftBlogs.length,
                        hasPrevious: parseInt(page) > 1,
                        hasNext: false,
                        itemsPerPage: parseInt(limit),
                        limit: parseInt(limit),
                      }
                    }
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
                <i className="fas fa-edit text-6xl text-muted-foreground mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">لا توجد مسودات</h3>
                <p className="text-muted-foreground mb-4">
                  لم يتم العثور على أي مسودات مدونات في النظام.
                </p>
                <Button onClick={() => setLocation("/blogs/create")}>
                  <i className="fas fa-plus mx-2"></i>
                  إنشاء أول مدونة
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteBlogDialog
        blogId={blogToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
