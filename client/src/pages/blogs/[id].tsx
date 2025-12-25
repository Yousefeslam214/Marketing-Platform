import { useLocation, useParams } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { TokenManager } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Blog } from "@shared/schema";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";


export default function BlogViewPage() {
  const params = useParams();
  const blogId = params.id;
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch fresh blog data from API without caching
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiRequest(
          "GET",
          `${VITE_API_BASE_URL}/api/blogs/${blogId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch blog data');
        }

        const data = await response.json();
        setBlogData(data.data);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setError(err as Error);
        toast({
          title: "Error",
          description: "Failed to load blog data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlogData();
    }
  }, [blogId, toast]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  if (error || !blogData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ErrorState
          title="لم يتم العثور على المدونة"
          message="المدونة المطلوبة غير موجودة أو تم حذفها"
          onRetry={() => window.location.reload()}
          showHomeButton
          onHome={() => setLocation("/blogs")}
        />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Custom header for blog detail */}
      <div className={`sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4 ${isRTL ? "rtl text-right" : "ltr"}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate" title={isRTL ? blogData.title.ar : blogData.title.en}>
              {isRTL ? blogData.title.ar : blogData.title.en}
            </h1>
            {blogData.excerpt && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {isRTL ? blogData.excerpt.ar : blogData.excerpt.en}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation("/admin/blogs/all")} className="shrink-0">
            <i className="fas fa-arrow-left mx-2"></i>
            <span className="hidden sm:inline">العودة للمدونات</span>
            <span className="sm:hidden">العودة</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 pt-8">
        <article className="space-y-8">
          {/* Blog Header */}
          <header className="border-b pb-8">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge variant="secondary">{isRTL ? blogData.category.ar : blogData.category.en}</Badge>
              <Badge variant="outline" className={
                blogData.status === "published" ? "border-green-200 text-green-700" :
                blogData.status === "draft" ? "border-yellow-200 text-yellow-700" :
                "border-gray-200 text-gray-700"
              }>
                {blogData.status === "published" ? "منشور" :
                 blogData.status === "draft" ? "مسودة" : "مؤرشف"}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" dir={isRTL ? "rtl" : "ltr"}>
              {isRTL ? blogData.title.ar : blogData.title.en}
            </h1>

            {blogData.excerpt && (
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed" dir={isRTL ? "rtl" : "ltr"}>
                {isRTL ? blogData.excerpt.ar : blogData.excerpt.en}
              </p>
            )}

            {/* Author and Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>بواسطة: <strong className="text-foreground">{blogData.author?.name || 'غير معروف'}</strong></span>
                <span className="hidden sm:inline">•</span>
                <span>{formatDate(new Date(blogData.createdAt).toISOString())}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <i className="fas fa-eye text-muted-foreground"></i>
                  <span>{blogData.views} مشاهدة</span>
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-heart text-muted-foreground"></i>
                  <span>{blogData.likes} إعجاب</span>
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-comments text-muted-foreground"></i>
                  <span>{Array.isArray(blogData.comments) ? blogData.comments.length : 0} تعليق</span>
                </span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blogData.featuredImage && (
            <div className="mb-8">
              <img
                src={blogData.featuredImage}
                alt={isRTL ? blogData.title.ar : blogData.title.en}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Tags */}
          {blogData.tags && Array.isArray(blogData.tags) && blogData.tags.length > 0 && (
            <div className="py-6 border-b">
              <div className="flex flex-wrap gap-2">
                {(isRTL ? blogData.tags.ar : blogData.tags.en).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reading time estimate */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground py-4 border-b">
            <span className="flex items-center gap-2">
              <i className="fas fa-clock"></i>
              <span>وقت القراءة: ~{Math.ceil((isRTL ? blogData.content.ar : blogData.content.en).length / 1000)} دقيقة</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">آخر تحديث: {formatDate(new Date(blogData.updatedAt).toISOString())}</span>
          </div>

        
          <div
            className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-12 prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-ul:space-y-2 prose-ol:space-y-2 prose-li:text-base"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {isRTL ? blogData.content.ar : blogData.content.en}
          </div>

          <Separator className="mb-8" />

        </article>
      </div>
    </div>
  );
}
