import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { createAdSchema, type CreateAdData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";
import { locationOptions } from "./targeting-form";
import { useLanguage } from "@/hooks/use-language";

interface AdEditorUpdateProps {
  adId: string;
  existingData: Partial<CreateAdData> | any;
  isUpdate?: boolean;
}

export function AdEditor({
  adId,
  existingData,
  isUpdate = false,
}: AdEditorUpdateProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    existingData?.imageUrl || null
  );
  const form = useForm<CreateAdData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      titleEn: existingData?.titleEn || "",
      titleAr: existingData?.titleAr || "",
      descriptionEn: existingData?.descriptionEn || "",
      descriptionAr: existingData?.descriptionAr || "",
      websiteUrl: existingData?.websiteUrl || "",
      imageUrl: existingData?.imageUrl || "",
      targetAudience: existingData?.targetAudience || "",
      targetCities: (existingData as any)?.targetCities || ["riyadh"],
      budgetType: existingData?.budgetType || "impressions",
      facebookLink: existingData?.facebookLink || "",
      instagramLink: existingData?.instagramLink || "",
      tiktokLink: existingData?.tiktokLink || "",
      youtubeLink: existingData?.youtubeLink || "",
      snapchatLink: existingData?.snapchatLink || "",
      googleAdsLink: existingData?.googleAdsLink || "",
    },
  });

  // If existingData is loaded asynchronously, reset the form so the defaultValues are applied
  useEffect(() => {
    if (existingData) {
      // provide only the fields we care about to avoid overwriting form state
      form.reset({
        titleEn: existingData.titleEn || "",
        titleAr: existingData.titleAr || "",
        descriptionEn: existingData.descriptionEn || "",
        descriptionAr: existingData.descriptionAr || "",
        websiteUrl: existingData.websiteUrl || "",
        imageUrl: existingData.imageUrl || "",
        targetAudience: existingData.targetAudience || "",
        targetCities: existingData.targetCities || ["riyadh"],
        budgetType: existingData.budgetType || "impressions",
        facebookLink: existingData.facebookLink || "",
        instagramLink: existingData.instagramLink || "",
        tiktokLink: existingData.tiktokLink || "",
        youtubeLink: existingData.youtubeLink || "",
        snapchatLink: existingData.snapchatLink || "",
        googleAdsLink: existingData.googleAdsLink || "",
      });
      // ensure photo preview reflects server image
      setPhotoPreview(existingData.imageUrl || null);
    }
  }, [existingData]);

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(
        `${VITE_API_BASE_URL}/api/advertising/uploadPhoto/${adId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TokenManager.getAccessToken()}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      const photoUrl = data.data?.photo;
      if (photoUrl) {
        form.setValue("imageUrl", photoUrl);
        // Replace local preview with server URL
        if (photoPreview && photoPreview.startsWith("blob:")) {
          URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(photoUrl);
        toast({
          title: t("ads", "photoUploaded"),
          description: t("ads", "photoUploadDescription"),
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t("ads", "uploadFailed"),
        description: error.message || t("ads", "uploadFailed"),
        variant: "destructive",
      });
      // If upload fails, remove the preview if it was a local preview
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(existingData?.imageUrl || null);
      }
    },
  });

  const handlePhotoSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("ads", "invalidFileType"),
          description: t("ads", "selectImageFile"),
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("ads", "fileTooLarge"),
          description: t("ads", "fileSizeLimit"),
          variant: "destructive",
        });
        return;
      }

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPhotoPreview(localPreview);

      setUploadingPhoto(true);
      try {
        await uploadPhotoMutation.mutateAsync(file);
      } catch {
        // Error handled in mutation onError
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const updateAdMutation = useMutation({
    mutationFn: async (data: CreateAdData) => {
      const response = await apiRequest(
        "PUT",
        `${VITE_API_BASE_URL}/api/advertising/${adId}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });
      queryClient.invalidateQueries({ queryKey: [`/api/advertising/${adId}`] });
      toast({
        title: t("ads", "adUpdatedSuccess"),
        description: t("ads", "adUpdatedDescription"),
      });

      setLocation(`/campaigns/${adId}`);
    },
    onError: (error: any) => {
      toast({
        title: t("ads", "updateAdFailed"),
        description: error.message || t("ads", "updateAdFailedDescription"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateAdData) => {
    await updateAdMutation.mutateAsync(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ads", "updateAdTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "titleEnLabel")}</FormLabel>
                    <FormControl>
                      <Input
                          placeholder={t("ads", "titleArPlaceholder")}
                        data-testid="input-title-en"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="titleAr"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>
                      {t("ads", "titleArLabel")}
                      {/* {t("ads", "titleArPlaceholder")} */}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل عنوان الإعلان..."
                        dir="rtl"
                        data-testid="input-title-ar"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "descriptionEnLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                          placeholder={t("ads", "descriptionEnPlaceholder")}
                        className="h-24 resize-none"
                        data-testid="textarea-description-en"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descriptionAr"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "descriptionArLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                          placeholder={t("ads", "descriptionArPlaceholder")}
                        dir="rtl"
                        className="h-24 resize-none"
                        data-testid="textarea-description-ar"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Photo Upload Section */}
            {isUpdate && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "adPhotoLabel")}</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {/* Photo Preview */}
                          {photoPreview && (
                            <div className="relative">
                              <img
                                src={photoPreview}
                                alt="Ad preview"
                                className="w-full max-w-md h-48 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  if (
                                    photoPreview &&
                                    photoPreview.startsWith("blob:")
                                  ) {
                                    URL.revokeObjectURL(photoPreview);
                                  }
                                  setPhotoPreview(null);
                                  form.setValue("imageUrl", "");
                                }}>
                                <i className="fas fa-trash mr-2"></i>
                                {t("ads", "removePhoto")}
                              </Button>
                            </div>
                          )}

                          {/* Upload Button */}
                          <div className="flex items-center gap-4">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoSelect}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={
                                uploadingPhoto || uploadPhotoMutation.isPending
                              }>
                              {uploadingPhoto || uploadPhotoMutation.isPending ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-2"></i>
                                  {t("ads", "uploading")}
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-upload mr-2"></i>
                                  {photoPreview ? t("ads", "changePhoto") : t("ads", "uploadPhoto")}
                                </>
                              )}
                            </Button>
                            {!photoPreview && (
                              <span className="text-sm text-muted-foreground">
                                {t("ads", "supportedFormatsNote")}
                              </span>
                            )}
                          </div>

                          {/* Hidden input for form validation */}
                          <Input
                            type="hidden"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Website URL */}
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("ads", "websiteUrlLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t("ads", "websiteUrlPlaceholder")}
                      data-testid="input-target-url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Audience */}
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("ads", "targetAudienceLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    data-testid="select-target-audience">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("ads", "targetAudiencePlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">
                        {t("ads", "audienceGeneral")}
                      </SelectItem>
                      <SelectItem value="cars">
                        {t("ads", "audienceCars")}
                      </SelectItem>
                      <SelectItem value="tech">{t("ads", "audienceTech") || "Tech"}</SelectItem>
                      <SelectItem value="machines">
                        {t("ads", "audienceMachines")}
                      </SelectItem>
                      <SelectItem value="students">
                        {t("ads", "audienceStudents")}
                      </SelectItem>
                      <SelectItem value="animals">
                        {t("ads", "audienceAnimals")}
                      </SelectItem>
                      <SelectItem value="furniture">
                        {t("ads", "audienceFurniture")}
                      </SelectItem>
                      <SelectItem value="services">
                        {t("ads", "audienceServices")}
                      </SelectItem>
                      <SelectItem value="jobs">
                        {t("ads", "audienceJobs")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Cities */}
            <FormField
              control={form.control}
              name="targetCities"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("ads", "targetCitiesLabel")}</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {locationOptions.map((city) => (
                      <div
                        key={city.value}
                        className="flex items-center space-x-2">
                        <Checkbox
                          id={city.value}
                          checked={(field.value as string[])?.includes(
                            city.value
                          )}
                          onCheckedChange={(checked: boolean) => {
                            const currentCities =
                              (field.value as string[]) || [];

                            if (checked) {
                              field.onChange([...currentCities, city.value]); // ✅ store only the value, not the full object
                            } else {
                              field.onChange(
                                currentCities.filter(
                                  (c: string) => c !== city.value
                                )
                              ); // ✅ remove correctly
                            }
                          }}
                        />
                        <div className="mx-2">
                          <label
                            htmlFor={city.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize
                                           mx-2">
                            {city.label} {/* ✅ show readable label */}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Type */}
            <FormField
              control={form.control}
              name="budgetType"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("ads", "budgetTypeLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    data-testid="select-budget-type">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("ads", "budgetTypePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="impressions">{t("ads", "impressions")}</SelectItem>
                       </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Media Links */}
            <div>
              <FormLabel className="text-base font-semibold">
                {t("ads", "socialMediaLinksLabel")}
              </FormLabel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <FormField
                  control={form.control}
                  name="facebookLink"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "facebookLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://facebook.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramLink"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "instagramLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://instagram.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tiktokLink"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "tiktokLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://tiktok.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtubeLink"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "youtubeLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://youtube.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="snapchatLink"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "snapchatLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://snapchat.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleAdsLink"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "googleAdsLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://ads.google.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateAdMutation.isPending}
              data-testid="button-update-ad">
              {updateAdMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {t("ads", "updatingAd")}
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {t("ads", "updateAdButton")}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
