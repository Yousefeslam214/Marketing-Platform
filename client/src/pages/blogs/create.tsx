import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { BlogEditor } from "@/components/blogs/create/blog-editor";
import { TokenManager } from "@/lib/auth";

export default function CreateBlogPage() {
  const [, setLocation] = useLocation();
  const { isRTL } = useLanguage();

  // Check if user is authenticated and is admin
  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  if (TokenManager.getRole() !== "admin") {
    setLocation("/blogs");
    return null;
  }

  // Check if admin has a username (required for blog creation)
  if (!TokenManager.getUsername()) {
    return (
      <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">خطأ في إعداد الحساب</h1>
          <p className="text-muted-foreground mb-4">
            يرجى تسجيل الدخول مرة أخرى. حسابك الإداري غير مكتمل.
          </p>
          <Button onClick={() => {
            TokenManager.clearTokens();
            setLocation("/login");
          }}>
            تسجيل الدخول مرة أخرى
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <Header
        title="إنشاء مدونة جديدة"
        description="اكتب وانشر محتوى مفيد ومثير للاهتمام"
        actions={
          <Button variant="outline" onClick={() => setLocation("/blogs")}>
            <i className="fas fa-arrow-left mx-2"></i>
            العودة للمدونات
          </Button>
        }
      />

      <main className="p-6">
        <BlogEditor />
      </main>
    </div>
  );
}
