import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { adminAllBlogsPath } from "@/lib/paths";

const localizedString = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined));

// Bilingual schema
const bilingualBlogSchema = z.object({
  title: z.object({
    en: localizedString,
    ar: localizedString
  }).refine(data => data.en || data.ar, {
    message: "At least one language is required for title"
  }),
  content: z.object({
    en: localizedString,
    ar: localizedString
  }).refine(data => data.en || data.ar, {
    message: "At least one language is required for content"
  }),
  excerpt: z.object({
    en: localizedString,
    ar: localizedString
  }).optional(),
  slug: z.object({
    en: localizedString,
    ar: localizedString
  }).optional(),
  category: z.object({
    en: localizedString,
    ar: localizedString
  }).refine(data => data.en || data.ar, {
    message: "At least one language is required for category"
  }),
  featuredImage: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
  status: z.enum(['draft', 'published', 'archived']).optional()
});

type BilingualBlogData = z.infer<typeof bilingualBlogSchema>;

interface BlogEditorUpdateProps {
  blogId: string;
  existingData: any;
  isUpdate?: boolean;
}

export function BlogEditorUpdate({
  blogId,
  existingData,
  isUpdate = false,
}: BlogEditorUpdateProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [blogData, setBlogData] = useState<any>(null);
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

  // Fetch fresh blog data
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        console.log('🔄 Fetching blog data for editing...');
        const response = await apiRequest(
          "GET",
          `${VITE_API_BASE_URL}/api/blogs/${blogId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch blog data');
        }

        const data = await response.json();
        setBlogData(data.data);
        setTagsEn(data.data?.tags?.en || []);
        setTagsAr(data.data?.tags?.ar || []);

        // Update form with fresh data
        form.reset({
          title: data.data?.title || { en: "", ar: "" },
          content: data.data?.content || { en: "", ar: "" },
          excerpt: data.data?.excerpt || { en: "", ar: "" },
          slug: data.data?.slug || { en: "", ar: "" },
          category: data.data?.category || { en: "", ar: "" },
          featuredImage: data.data?.featuredImage || "",
        });

        console.log('✅ Blog data loaded for editing');
      } catch (error) {
        console.error('❌ Error fetching blog data:', error);
        toast({
          title: "Error",
          description: "Failed to load blog data",
          variant: "destructive",
        });
      }
    };

    if (blogId) {
      fetchBlogData();
    }
  }, [blogId, form, toast]);

  const updateBlogMutation = useMutation({
    mutationFn: async (data: BilingualBlogData) => {
      const cleanData = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value === '' || value === null || value === undefined) {
            continue;
          }
          if (typeof value === 'object' && !Array.isArray(value)) {
            const cleanedNested = cleanData(value);
            if (Object.keys(cleanedNested).length > 0) {
              cleaned[key] = cleanedNested;
            }
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };

      const blogData = {
        ...cleanData(data),
        tags: {
          en: tagsEn,
          ar: tagsAr
        }
      };

      const response = await apiRequest(
        "PATCH",
        `${VITE_API_BASE_URL}/api/blogs/${blogId}`,
        blogData
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      console.log('✅ Update successful, CLEARING ENTIRE CACHE...');

      // Completely clear the entire cache to remove ALL old copies
      queryClient.clear();

      console.log('✅ ENTIRE CACHE CLEARED - NO OLD DATA REMAINING');

      toast({
        title: t("blogs", "blogUpdated"),
        description: "تم حفظ التغييرات على المدونة",
      });

      // Force page reload to ensure NO cached data anywhere
      window.location.href = adminAllBlogsPath();
    },
    onError: (error: any) => {
      console.error('❌ Update error:', error);
      toast({
        title: t("blogs", "updateError"),
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });




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

  const onSubmit = async (data: BilingualBlogData) => {
    await updateBlogMutation.mutateAsync(data);
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

    form.setValue(`slug.${lang}`, slug);
  };

  // Show loading while fetching blog data
  if (!blogData) {
    return (
      <Card className={`mt-24 ${isRTL ? "rtl text-right" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
        <CardContent className="p-6 text-center">
          <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-4"></i>
          <p className="text-muted-foreground">{t("blogs", "loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mt-24 ${isRTL ? "rtl text-right" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle>{t("blogs", "editBlog")}</CardTitle>
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
                        <Input placeholder="رابط-المدونة" {...field} dir="rtl" />
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

                <div className="space-y-4">
                  <FormLabel>{t("blogs", "arabicTags")}</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="أضف وسم..."
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
                      إضافة
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
                        <Input placeholder="blog-url-slug" {...field} />
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

                <div className="space-y-4">
                  <FormLabel>{t("blogs", "englishTags")}</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
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
                      Add
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

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(adminAllBlogsPath())}
                >
                  {t("blogs", "cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={updateBlogMutation.isPending}
                >
                  {updateBlogMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mx-2"></i>
                      {t("blogs", "saving")}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mx-2"></i>
                      {t("blogs", "updateBlog")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
