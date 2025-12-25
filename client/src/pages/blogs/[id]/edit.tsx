import { useLocation, useParams } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { BlogEditorUpdate } from "@/components/blogs/update/blog-editor-update";
import { Blog } from "@shared/schema";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";
import { TokenManager } from "@/lib/auth";
import { adminAllBlogsPath } from "@/lib/paths";

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params.id;
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();

  // Check if user is authenticated and is admin
  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  if (TokenManager.getRole() !== "admin") {
    setLocation("/blogs");
    return null;
  }

  const {
    data: blog,
    isLoading,
    error,
  } = useApiQuery({
    key: [`/blogs/${blogId}`],
    url: `${VITE_API_BASE_URL}/api/blogs/${blogId}`,
  });

  const blogData = blog?.data as Blog;

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <Header title={t("blogs", "loadingBlog")} />
        <main className="p-6 mt-24 flex items-center justify-center min-h-[60vh]">
          <Loading />
        </main>
      </div>
    );
  }

  if (error || !blogData) {
    return (
      <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <Header title={t("blogs", "loadingBlogError")} />
        <main className="p-6 mt-24">
          <ErrorState
            title={t("blogs", "blogNotFound")}
            message={t("blogs", "blogNotFoundMessage")}
            showHomeButton
            onHome={() => setLocation(adminAllBlogsPath())}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <Header
        title={isRTL ? blogData.title.ar : blogData.title.en}
        description={t("blogs", "editBlogDescription")}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation(`/blogs/${blogId}`)}>
              <i className="fas fa-eye mx-2"></i>
{t("blogs", "viewBlog")}
            </Button>
            <Button variant="outline" onClick={() => setLocation(adminAllBlogsPath())}>
              <i className="fas fa-arrow-left mx-2"></i>
{t("blogs", "backToBlogs")}
            </Button>
          </div>
        }
      />

      <main className="p-6">
        <BlogEditorUpdate
          blogId={blogId!}
          existingData={blogData}
          isUpdate={true}
        />
      </main>
    </div>
  );
}
