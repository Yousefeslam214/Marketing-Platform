// components/blogs/blog-card.tsx
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { TokenManager } from "@/lib/auth";
import { Blog } from "@shared/schema";

interface BlogCardProps {
  blog: Blog;
  language?: "en" | "ar";
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  isLoading?: boolean;
}

export function BlogCard({
  blog,
  language = "ar",
  onView,
  onEdit,
  onDelete,
  showActions = true,
  onPublish,
  onArchive,
  isLoading = false,
}: BlogCardProps) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const isAdmin = TokenManager.getRole() === "admin";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return "fas fa-globe";
      case "draft":
        return "fas fa-edit";
      case "archived":
        return "fas fa-archive";
      default:
        return "fas fa-question-circle";
    }
  };

  const getStatusText = (status: string) => {
    if (language === "ar") {
      switch (status) {
        case "published":
          return "منشور";
        case "draft":
          return "مسودة";
        case "archived":
          return "مؤرشف";
        default:
          return status;
      }
    } else {
      switch (status) {
        case "published":
          return "Published";
        case "draft":
          return "Draft";
        case "archived":
          return "Archived";
        default:
          return status;
      }
    }
  };

  // Get localized content based on language
  const title = (language === "ar" ? blog.title.ar : blog.title.en) || blog.title.en || blog.title.ar || "";
  const excerpt = (language === "ar" ? blog.excerpt?.ar : blog.excerpt?.en) || blog.excerpt?.en || blog.excerpt?.ar || "";
  const category = (language === "ar" ? blog.category.ar : blog.category.en) || blog.category.en || blog.category.ar || "";
  const tags = (language === "ar" ? blog.tags.ar : blog.tags.en) || [];

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow min-w-[350px] h-full flex flex-col justify-between"
      data-testid={`blog-card-${blog._id}`}
    >
      <CardContent className="p-6 flex flex-col justify-between h-full">
        {/* Header with title and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-foreground truncate mb-2"
              data-testid={`blog-title-${blog._id}`}
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              {title}
            </h3>
            {excerpt && (
              <p
                className="text-sm text-muted-foreground line-clamp-2"
                data-testid={`blog-excerpt-${blog._id}`}
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {excerpt}
              </p>
            )}
          </div>
          <Badge
            className={`${getStatusColor(blog.status)} ml-2 flex items-center gap-1 flex-shrink-0`}
          >
            <i className={`${getStatusIcon(blog.status)} text-xs`}></i>
            {getStatusText(blog.status)}
          </Badge>
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="w-full h-32 bg-muted rounded-lg mb-4 overflow-hidden">
            <img
              src={blog.featuredImage}
              alt={title}
              className="w-full h-full object-cover"
              data-testid={`blog-image-${blog._id}`}
            />
          </div>
        )}

        {/* Blog Info */}
        <div className="space-y-3">
          {/* Tags and Category */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              )}
              {tags && tags.length > 0 && (
                <div className="flex gap-1">
                  {tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <i className="fas fa-eye"></i>
                {blog.views}
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-heart"></i>
                {blog.likes}
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-comments"></i>
                {Array.isArray(blog.comments) ? blog.comments.length : 0}
              </span>
            </div>
            <span className="text-xs">
              {new Date(blog.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
            </span>
          </div>

          {/* Author */}
          <div className="text-sm text-muted-foreground" dir={language === "ar" ? "rtl" : "ltr"}>
            <span>{language === "ar" ? "بواسطة: " : "By: "}</span>
            <span className="font-medium">{blog.author?.name || (language === "ar" ? "غير معروف" : "Unknown")}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 flex-col mt-4 pt-4 border-t border-border">
            <div className="w-full text-center font-medium space-x-2 flex gap-2 flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(blog._id)}
                className="flex-1"
                data-testid={`button-view-blog-${blog._id}`}
              >
                <i className="fas fa-eye mx-1"></i>
                {language === "ar" ? "عرض" : "View"}
              </Button>

              {/* Admin-only actions */}
              {isAdmin && (
                <>
                  <Link href={`/blogs/${blog._id}/edit`} className="w-[50%]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`button-edit-blog-${blog._id}`}
                    >
                      <i className="fas fa-edit mx-1"></i>
                      {language === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Admin additional actions */}
            {isAdmin && (
              <div className="w-full flex gap-2">
                {onPublish && blog.status !== "published" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPublish?.(blog._id)}
                    className="flex-1"
                    disabled={isLoading}
                    data-testid={`button-publish-blog-${blog._id}`}
                  >
                    <i className="fas fa-globe mx-1"></i>
                    {language === "ar" ? "نشر" : "Publish"}
                  </Button>
                )}

                {onArchive && blog.status === "published" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onArchive?.(blog._id)}
                    className="flex-1"
                    disabled={isLoading}
                    data-testid={`button-archive-blog-${blog._id}`}
                  >
                    <i className="fas fa-archive mx-1"></i>
                    {language === "ar" ? "أرشفة" : "Archive"}
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(blog._id)}
                    className="flex-1"
                    disabled={isLoading}
                    data-testid={`button-delete-blog-${blog._id}`}
                  >
                    <i className="fas fa-trash mx-1"></i>
                    {language === "ar" ? "حذف" : "Delete"}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}