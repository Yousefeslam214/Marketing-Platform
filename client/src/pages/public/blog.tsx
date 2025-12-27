import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useSeo } from "@/contexts/seo-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  category: "Product" | "How-to" | "Updates";
  tag: string;
  date: string;
  author: string;
  image: string;
};

type CategoryOption = "All" | Post["category"];

const featuredPost: Post = {
  id: "ai-customer-experiences",
  title: "How AI Workflows Elevate Customer Experiences",
  excerpt:
    "See how teams pair automation with human review to deliver faster, more accurate answers at scale.",
  category: "Product",
  tag: "Product",
  date: "February 18, 2024",
  author: "Octoups Ad Team",
  image:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
};

const recentPosts: Post[] = [
  {
    id: "playbook-2024",
    title: "The 2024 AI Support Playbook",
    excerpt:
      "Practical guidance on standing up an AI-first help center while keeping humans in the loop.",
    category: "How-to",
    tag: "How-to",
    date: "March 12, 2024",
    author: "Sarah Malik",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "product-updates",
    title: "Product Updates: Faster Answers, Richer Insights",
    excerpt:
      "A closer look at new analytics, smarter routing, and better multilingual responses.",
    category: "Updates",
    tag: "Updates",
    date: "March 3, 2024",
    author: "Product Team",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "human-ai-handbook",
    title: "Human + AI: A Practical Handbook for Support Leads",
    excerpt:
      "Frameworks for defining guardrails, reviewing AI outputs, and keeping quality high.",
    category: "How-to",
    tag: "How-to",
    date: "February 22, 2024",
    author: "Lina Chen",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "data-trust",
    title: "Earning Trust With Secure AI Data Practices",
    excerpt:
      "The controls we use to protect customer data while enabling powerful AI retrieval.",
    category: "Updates",
    tag: "Updates",
    date: "February 10, 2024",
    author: "Security Team",
    image:
      "https://images.unsplash.com/photo-1526378722484-cc5c7100a3d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "multilingual-support",
    title: "Designing Multilingual Support Journeys",
    excerpt:
      "Best practices for launching consistent experiences across Arabic and English audiences.",
    category: "Product",
    tag: "Product",
    date: "January 30, 2024",
    author: "Experience Lab",
    image:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "metrics-that-matter",
    title: "The Metrics That Matter for AI-Powered Support",
    excerpt:
      "Which KPIs reveal real progress when you bring automation into your service org.",
    category: "Updates",
    tag: "Updates",
    date: "January 18, 2024",
    author: "Insights Team",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
];

export default function BlogLanding() {
  const { isRTL, t } = useLanguage();
  const { setOverride } = useSeo();

  const categoryOptions = useMemo<CategoryOption[]>(
    () => ["All", "Product", "How-to", "Updates"],
    []
  );

  const categoryLabels = useMemo(
    () => ({
      All: t("blogLanding", "categories.all"),
      Product: t("blogLanding", "categories.product"),
      "How-to": t("blogLanding", "categories.howTo"),
      Updates: t("blogLanding", "categories.updates"),
    }),
    [t]
  );

  const [activeCategory, setActiveCategory] = useState<CategoryOption>("All");

  const seoTitle = t("blogLanding", "seoTitle");
  const seoDescription = t("blogLanding", "seoDescription");

  useEffect(() => {
    setOverride({
      title: seoTitle,
      description: seoDescription,
    });

    return () => setOverride(null);
  }, [setOverride, seoTitle, seoDescription]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return recentPosts;
    return recentPosts.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container relative px-4 py-16 sm:py-20 lg:py-24">
          <div
            className={`max-w-3xl ${
              isRTL ? "ml-auto text-right" : "mr-auto text-left"
            }`}>
            <Badge className="mb-4">{t("blogLanding", "badge")}</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
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

      <section className="container px-4 pb-12 lg:pb-16">
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
            <Card className="overflow-hidden border-muted/70 shadow-sm">
              <div className="relative h-64 sm:h-80">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
              </div>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">
                    {categoryLabels[featuredPost.category] || featuredPost.tag}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {featuredPost.date}
                  </span>
                </div>
                <CardTitle className="text-2xl">{featuredPost.title}</CardTitle>
                <CardDescription className="text-base">
                  {featuredPost.excerpt}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{featuredPost.author}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{t("blogLanding", "readTime")}</span>
                </div>
                <div
                  className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
                  <Link href={`/blogs/${featuredPost.id}`}>
                    <Button className="mt-2">
                      {t("blogLanding", "readMore")}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card className="lg:col-span-2 border-muted/70 shadow-sm">
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
                />
              </div>
              <Button className="w-full">
                {t("blogLanding", "newsletterCta")}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t("blogLanding", "newsletterDisclaimer")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="recent-posts" className="container px-4 pb-16 lg:pb-24">
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
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow"
                    : "border border-input bg-background hover:bg-muted"
                }`}>
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="h-full flex flex-col overflow-hidden border-muted/70 shadow-sm">
              <div className="relative h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
                <Badge
                  className={`absolute top-3 ${isRTL ? "right-3" : "left-3"}`}>
                  {categoryLabels[post.category] || post.tag}
                </Badge>
              </div>
              <CardContent className="flex flex-col gap-3 p-5 flex-1">
                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.author}</span>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed line-clamp-3">
                  {post.excerpt}
                </CardDescription>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-primary">
                    {categoryLabels[post.category]}
                  </span>
                  <Link href={`/blogs/${post.id}`}>
                    <Button variant="ghost" size="sm" className="px-3">
                      {t("blogLanding", "readMore")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
