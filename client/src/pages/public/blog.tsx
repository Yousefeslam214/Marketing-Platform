import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useSeo } from "@/contexts/seo-context";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Blog } from "@shared/schema";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

export default function BlogLanding() {
  const { isRTL, t } = useLanguage();
  const { setOverride } = useSeo();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "loading" | "success" | "error" | "invalid"
  >("idle");
  const lang = isRTL ? "ar" : "en";

  const seoTitle = t("blogLanding", "seoTitle");
  const seoDescription = t("blogLanding", "seoDescription");

  useEffect(() => {
    setOverride({
      title: seoTitle,
      description: seoDescription,
    });

    return () => setOverride(null);
  }, [setOverride, seoTitle, seoDescription]);

  // Fetch published blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: "1",
          limit: "12",
          t: Date.now().toString(),
        });

        const url = `${VITE_API_BASE_URL}/api/blogs/published?${params.toString()}`;
        const response = await apiRequest("GET", url);

        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }

        const data = await response.json();
        setBlogs(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err as Error);
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const resolvedBlogs = useMemo(() => {
    const locale = lang === "ar" ? "ar-SA" : "en-US";
    return blogs.map((blog) => {
      const localizedCategory =
        (blog.category as any)?.[lang] ||
        (blog.category as any)?.ar ||
        (blog.category as any)?.en ||
        "";

      return {
        ...blog,
        localizedTitle:
          blog.title?.[lang] || blog.title?.ar || blog.title?.en || "",
        localizedExcerpt:
          blog.excerpt?.[lang] || blog.excerpt?.ar || blog.excerpt?.en || "",
        localizedCategory,
        localizedAuthor:
          blog.author?.name || (lang === "ar" ? "غير معروف" : "Unknown"),
        localizedDate: blog.createdAt
          ? new Date(blog.createdAt).toLocaleDateString(locale)
          : "",
      };
    });
  }, [blogs, lang]);

  const categories = useMemo(() => {
    const unique = resolvedBlogs
      .map((b) => b.localizedCategory)
      .filter((val, idx, self) => val && self.indexOf(val) === idx);
    return unique;
  }, [resolvedBlogs]);

  const categoryLabels = useMemo(() => {
    const baseLabels: Record<string, string> = {
      all: t("blogLanding", "categories.all"),
    };
    categories.forEach((cat) => {
      baseLabels[cat] = cat;
    });
    return baseLabels;
  }, [categories, t]);

  const sortedBlogs = useMemo(() => {
    return [...resolvedBlogs].sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    );
  }, [resolvedBlogs]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return sortedBlogs;
    return sortedBlogs.filter(
      (blog) => blog.localizedCategory === activeCategory
    );
  }, [activeCategory, sortedBlogs]);

  const featuredPost = filteredPosts[0] || sortedBlogs[0];
  const fallbackImage = "https://placehold.co/1200x800?text=Blog";

  const handleNewsletterSubmit = useCallback(async () => {
    const emailTrimmed = newsletterEmail.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);

    if (!isValidEmail) {
      setNewsletterStatus("invalid");
      return;
    }

    try {
      setNewsletterStatus("loading");
      const url = `${VITE_API_BASE_URL}/api/users/email`;
      const response = await apiRequest("POST", url, { email: emailTrimmed });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch (err) {
      console.error(err);
      setNewsletterStatus("error");
    }
  }, [newsletterEmail]);

  return (
    <div
      className={`min-h-screen bg-background text-foreground 
        mx-auto
        ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container  relative px-4 py-16 sm:py-20 lg:py-24">
          <div
            className={`max-w-3xl
              mx-auto
              flex flex-col items-center text-center align-center
              ${isRTL ? " text-right" : " text-left"}`}>
            <Badge className="mb-4">{t("blogLanding", "badge")}</Badge>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4
            center
            ">
              {t("blogLanding", "title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t("blogLanding", "subtitle")}
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-3 ${
                isRTL ? "sm:flex-row-reverse" : ""
              }`}>
              <Button size="lg" asChild>
                <a href="#recent-posts">{t("blogLanding", "browseCta")}</a>
              </Button>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  {t("blogLanding", "startCta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="container px-4 ">
        <div className="grid gap-8 lg:grid-cols-5 items-stretch">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {t("blogLanding", "featuredTitle")}
              </h2>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {t("blogLanding", "featuredBadge")}
              </Badge>
            </div>
            {isLoading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <Loading />
              </div>
            ) : error || !featuredPost ? (
              <Card className="overflow-hidden border-muted/70 shadow-sm">
                <CardHeader className="space-y-3">
                  {error ? (
                    <ErrorState
                      title={t("blogsPage", "loadFailedTitle")}
                      message={
                        error?.message || t("blogsPage", "loadFailedMessage")
                      }
                    />
                  ) : (
                    <CardDescription>
                      {t("blogsPage", "emptyMessage")}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            ) : (
              <Card className="overflow-hidden border-muted/70 shadow-sm">
                <Link href={`/blogs/${featuredPost._id}`}>
                  <div className="relative h-64 sm:h-80">
                    <img
                      src={featuredPost.featuredImage || fallbackImage}
                      alt={
                        featuredPost.title?.[lang] ||
                        featuredPost.title?.ar ||
                        featuredPost.title?.en ||
                        ""
                      }
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                  </div>
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {(featuredPost.category as any)?.[lang] ||
                          (featuredPost.category as any)?.ar ||
                          (featuredPost.category as any)?.en ||
                          ""}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(featuredPost.createdAt).toLocaleDateString(
                          isRTL ? "ar-SA" : "en-US"
                        )}
                      </span>
                    </div>
                    <CardTitle className="text-2xl">
                      {featuredPost.title?.[lang] ||
                        featuredPost.title?.ar ||
                        featuredPost.title?.en ||
                        ""}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {featuredPost.excerpt?.[lang] ||
                        featuredPost.excerpt?.ar ||
                        featuredPost.excerpt?.en ||
                        ""}
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{t("blogLanding", "readTime")}</span>
                    </div>
                    <div
                      className={`flex ${
                        isRTL ? "justify-start" : "justify-end"
                      }`}>
                      <Link href={`/blogs/${featuredPost._id}`}>
                        <Button className="mt-2">
                          {t("blogLanding", "readMore")}
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            )}
          </div>

          <Card
            className="lg:col-span-2 border-muted/70 shadow-sm
          h-fit
          ">
            <CardHeader>
              <h2 className="text-xl font-semibold leading-none tracking-tight">
                {t("blogLanding", "newsletterTitle")}
              </h2>
              <CardDescription>
                {t("blogLanding", "newsletterDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="newsletter-email">
                  {t("blogLanding", "newsletterEmailLabel")}
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder={t("blogLanding", "newsletterEmailPlaceholder")}
                  className="w-full"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    setNewsletterStatus("idle");
                  }}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleNewsletterSubmit}
                disabled={newsletterStatus === "loading"}>
                {t("blogLanding", "newsletterCta")}
              </Button>
              {newsletterStatus !== "idle" && (
                <p
                  className={`text-sm ${
                    newsletterStatus === "success"
                      ? "text-green-600"
                      : newsletterStatus === "loading"
                      ? "text-muted-foreground"
                      : "text-destructive"
                  }`}>
                  {newsletterStatus === "success" &&
                    t("blogLanding", "newsletterSuccess")}
                  {newsletterStatus === "error" &&
                    t("blogLanding", "newsletterError")}
                  {newsletterStatus === "invalid" &&
                    t("blogLanding", "newsletterInvalidEmail")}
                  {newsletterStatus === "loading" &&
                    t("blogLanding", "newsletterSubmitting")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("blogLanding", "newsletterDisclaimer")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        className="container px-4 pb-16 lg:pb-24
      pt-12 lg:pt-16
      "
        id="recent-posts">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className={`${isRTL ? "md:text-right" : "md:text-left"}`}>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("blogLanding", "latestTitle")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("blogLanding", "latestSubtitle")}
            </p>
          </div>
          <div
            className={`flex flex-wrap gap-2 ${
              isRTL ? "md:justify-start" : "md:justify-end"
            }`}>
            {["all", ...categories].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow"
                    : "border border-input bg-background hover:bg-muted"
                }`}>
                {categoryLabels[category] || category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <ErrorState
              title={t("blogsPage", "loadFailedTitle")}
              message={error?.message || t("blogsPage", "loadFailedMessage")}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-blog text-6xl text-muted-foreground mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">
                {t("blogsPage", "emptyTitle")}
              </h3>
              <p className="text-muted-foreground">
                {t("blogsPage", "emptyMessage")}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => {
              const title =
                post.title?.[lang] || post.title?.ar || post.title?.en || "";
              const excerpt =
                post.excerpt?.[lang] ||
                post.excerpt?.ar ||
                post.excerpt?.en ||
                "";
              const category =
                (post.category as any)?.[lang] ||
                (post.category as any)?.ar ||
                (post.category as any)?.en ||
                "";

              return (
                <Link
                  key={post._id}
                  href={`/blogs/${post._id}`}
                  className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
                  <Card className="h-full flex flex-col overflow-hidden border-muted/70 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="relative h-48">
                      <img
                        src={post.featuredImage || fallbackImage}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                      <Badge
                        className={`absolute top-3 ${
                          isRTL ? "right-3" : "left-3"
                        }`}>
                        {category}
                      </Badge>
                    </div>
                    <CardContent className="flex flex-col gap-3 p-5 flex-1">
                      <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        <span>{post.localizedDate}</span>
                        <span>•</span>
                        <span>
                          {post.author?.name ||
                            (isRTL ? "غير معروف" : "Unknown")}
                        </span>
                      </div>
                      <CardTitle className="text-xl leading-tight">
                        {title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed line-clamp-3">
                        {excerpt}
                      </CardDescription>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-sm font-medium text-primary">
                          {category}
                        </span>
                        <Button variant="ghost" size="sm" className="px-3">
                          {t("blogLanding", "readMore")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
