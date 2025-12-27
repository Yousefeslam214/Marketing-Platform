import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useState } from "react";
import { TokenManager } from "@/lib/auth";
import { useAuth } from "@/contexts/auth-context";
import { z } from "zod";
import { adminAllBlogsPath } from "@/lib/paths";

// Bilingual schema
const bilingualBlogSchema = z.object({
  title: z.object({
    en: z.string().optional(),
    ar: z.string().optional()
  }).refine(data => data.en || data.ar, {
    message: "At least one language is required for title"
  }),
  content: z.object({
    en: z.string().optional(),
    ar: z.string().optional()
  }).refine(data => data.en || data.ar, {
    message: "At least one language is required for content"
  }),
  excerpt: z.object({
    en: z.string().max(500).optional(),
    ar: z.string().max(500).optional()
  }).optional(),
  slug: z.object({
    en: z.string().optional(),
    ar: z.string().optional()
  }).optional(),
  category: z.object({
    en: z.string().optional(),
    ar: z.string().optional()
  }).refine(data => data.en || data.ar, {
    message: "At least one language is required for category"
  }),
  featuredImage: z.string().url().optional().or(z.literal("")),
});

type BilingualBlogData = z.infer<typeof bilingualBlogSchema>;

export function BlogEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [tagsEn, setTagsEn] = useState<string[]>([]);
  const [tagsAr, setTagsAr] = useState<string[]>([]);
  const [tagInputEn, setTagInputEn] = useState("");
  const [tagInputAr, setTagInputAr] = useState("");

  const form = useForm<BilingualBlogData>({
    resolver: zodResolver(bilingualBlogSchema),
    defaultValues: {
      title: { en: "", ar: "" },
      content: { en: "", ar: "" },
      excerpt: { en: "", ar: "" },
      slug: { en: "", ar: "" },
      category: { en: "", ar: "" },
      featuredImage: "",
    },
  });

  const createBlogMutation = useMutation({
    mutationFn: async (data: BilingualBlogData) => {
      const blogData = {
        ...data,
        tags: {
          en: tagsEn,
          ar: tagsAr
        }
      };

      console.log("Sending bilingual blog creation request:", blogData);

      const response = await apiRequest(
        "POST",
        `${VITE_API_BASE_URL}/api/blogs`,
        blogData
      );

      queryClient.clear();
      return response.json();
    },
    onSuccess: (data) => {
      console.log("✅ Blog creation successful, cache cleared:", data);
      const createdBlogId = data?.data?._id || data?.data?.id;
      toast({
        title: t("blogs", "blogCreated"),
        description: `تم حفظ المدونة كمسودة${createdBlogId ? ` (ID: ${createdBlogId})` : ''}`,
      });

      // Redirect to photo upload page instead of admin blogs list
      if (createdBlogId) {
        setLocation(`/blogs/${createdBlogId}/upload-photo`);
      } else {
        // Fallback to admin blogs list if no ID
        window.location.href = adminAllBlogsPath();
      }
    },
    onError: (error: any) => {
      toast({
        title: t("blogs", "creationError"),
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: BilingualBlogData) => {
    console.log("Form submitted with bilingual data:", data);
    await createBlogMutation.mutateAsync(data);
  };

  const addTag = (lang: "en" | "ar") => {
    if (lang === "en") {
      if (tagInputEn.trim() && !tagsEn.includes(tagInputEn.trim())) {
        setTagsEn([...tagsEn, tagInputEn.trim()]);
        setTagInputEn("");
      }
    } else {
      if (tagInputAr.trim() && !tagsAr.includes(tagInputAr.trim())) {
        setTagsAr([...tagsAr, tagInputAr.trim()]);
        setTagInputAr("");
      }
    }
  };

  const removeTag = (lang: "en" | "ar", tagToRemove: string) => {
    if (lang === "en") {
      setTagsEn(tagsEn.filter(tag => tag !== tagToRemove));
    } else {
      setTagsAr(tagsAr.filter(tag => tag !== tagToRemove));
    }
  };

  const generateSlug = (title: string, lang: "en" | "ar") => {
    if (!title || title.trim() === '') {
      form.setValue(`slug.${lang}`, '');
      return;
    }

    let slug: string;
    if (lang === "en") {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
    } else {
      slug = title
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF0-9-]/g, '')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
    }

    if (!slug || slug === '') {
      slug = 'untitled-blog';
    }

    form.setValue(`slug.${lang}`, slug);
  };

  return (
    <Card className={`mt-24 ${isRTL ? "rtl text-right" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle>{t("blogs", "createNewBlog")} ({t("blogs", "arabic")} / {t("blogs", "english")})</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="ar" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ar">{t("blogs", "arabic")}</TabsTrigger>
                <TabsTrigger value="en">{t("blogs", "english")}</TabsTrigger>
              </TabsList>

              {/* Arabic Tab */}
              <TabsContent value="ar" className="space-y-6">
                <FormField
                  control={form.control}
                  name="title.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "arabicTitle")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("blogs", "arabicTitlePlaceholder")}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            generateSlug(e.target.value, "ar");
                          }}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "arabicSlug")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("blogs", "blogSlug")} {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "arabicExcerpt")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("blogs", "arabicExcerptPlaceholder")}
                          className="h-20 resize-none"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "arabicContent")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("blogs", "arabicContentPlaceholder")}
                          className="h-64 resize-none"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "arabicCategory")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("blogs", "arabicCategoryPlaceholder")} {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Arabic Tags */}
                <div className="space-y-4">
                  <FormLabel>{t("blogs", "arabicTags")}</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("blogs", "addTagPlaceholder")}
                      value={tagInputAr}
                      onChange={(e) => setTagInputAr(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag("ar");
                        }
                      }}
                      dir="rtl"
                    />
                    <Button type="button" onClick={() => addTag("ar")} variant="outline">
                      {t("blogs", "addTag")}
                    </Button>
                  </div>
                  {tagsAr.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tagsAr.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag("ar", tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* English Tab */}
              <TabsContent value="en" className="space-y-6">
                <FormField
                  control={form.control}
                  name="title.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "englishTitle")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("blogs", "englishTitlePlaceholder")}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            generateSlug(e.target.value, "en");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "englishSlug")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("blogs", "blogSlug")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "englishExcerpt")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("blogs", "englishExcerptPlaceholder")}
                          className="h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "englishContent")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("blogs", "englishContentPlaceholder")}
                          className="h-64 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blogs", "englishCategory")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("blogs", "englishCategoryPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* English Tags */}
                <div className="space-y-4">
                  <FormLabel>{t("blogs", "englishTags")}</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("blogs", "tagInputPlaceholder")}
                      value={tagInputEn}
                      onChange={(e) => setTagInputEn(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag("en");
                        }
                      }}
                    />
                    <Button type="button" onClick={() => addTag("en")} variant="outline">
                      {t("blogs", "addTag")}
                    </Button>
                  </div>
                  {tagsEn.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tagsEn.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag("en", tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Featured Image - Common for both languages */}
            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("blogs", "featuredImageOptional")}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(adminAllBlogsPath())}
              >
                {t("blogs", "cancel")}
              </Button>
              <Button type="submit" disabled={createBlogMutation.isPending}>
                {createBlogMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mx-2"></i>
                    {t("blogs", "saving")}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mx-2"></i>
                    {t("blogs", "createBlog")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}