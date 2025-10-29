import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import { createAdSchema, type CreateAdData } from "@shared/schema";
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
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AdEditorUpdateProps {
  adId: string;
  existingData: Partial<CreateAdData> | any;
  isUpdate?: boolean;
}

// Function to clear all ad-related cache
export const clearAdCache = (adId: string) => {
  queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });
  queryClient.invalidateQueries({ queryKey: [`/api/advertising/${adId}`] });
  queryClient.invalidateQueries({ queryKey: ["/ads/approved"] });
  queryClient.invalidateQueries({ queryKey: ["/ads/pending"] });
  queryClient.invalidateQueries({ queryKey: ["/ads/rejected"] });
  queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  queryClient.removeQueries({ queryKey: ["/api/advertising"] });
  queryClient.removeQueries({ queryKey: [`/api/advertising/${adId}`] });
};

export function AdEditor({
  adId,
  existingData,
  isUpdate = false,
}: AdEditorUpdateProps) {
  console.log("existingData:", existingData);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  // support multiple images
  const initialImages: string[] = Array.isArray(existingData?.imageUrl)
    ? existingData.imageUrl
    : existingData?.imageUrl
    ? [existingData.imageUrl]
    : [];
  const [serverImages, setServerImages] = useState<string[]>(initialImages);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialImages[0] || null
  );
  const editorRef = useRef<any>(null);
  const [editingFile, setEditingFile] = useState<string | File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editScale, setEditScale] = useState(1);
  const [editRotate, setEditRotate] = useState(0);

  const form = useForm<CreateAdData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      titleEn: existingData?.titleEn || "",
      titleAr: existingData?.titleAr || "",
      descriptionEn: existingData?.descriptionEn || "",
      descriptionAr: existingData?.descriptionAr || "",
      websiteUrl: existingData?.websiteUrl || "",
      phoneNumber: existingData?.phoneNumber || "",
      imageUrl: existingData?.imageUrl || "",
      targetAudience: existingData?.targetAudience || "",
      targetCities: (existingData as any)?.targetCities || [],
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
        phoneNumber: existingData.phoneNumber || "",
        imageUrl: existingData.imageUrl || "",
        targetAudience: existingData.targetAudience || "",
        targetCities: existingData.targetCities || [],
        budgetType: existingData.budgetType || "impressions",
        facebookLink: existingData.facebookLink || "",
        instagramLink: existingData.instagramLink || "",
        tiktokLink: existingData.tiktokLink || "",
        youtubeLink: existingData.youtubeLink || "",
        snapchatLink: existingData.snapchatLink || "",
        googleAdsLink: existingData.googleAdsLink || "",
      });
      // ensure photo preview reflects server image(s)
      const imgs = Array.isArray(existingData?.imageUrl)
        ? existingData.imageUrl
        : existingData?.imageUrl
        ? [existingData.imageUrl]
        : [];
      setServerImages(imgs);
      setPhotoPreview(imgs[0] || null);
      // keep form in sync
  // keep form.imageUrl as a single string (primary image) to match schema
  form.setValue("imageUrl", imgs[0] || "");
    }
  }, [existingData]);

  // keep form value in sync when serverImages change
  useEffect(() => {
  // schema expects a string for imageUrl; keep the primary image as the form value
  form.setValue("imageUrl", serverImages[0] || "");
  }, [serverImages]);

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

      // Attempt to parse JSON; if parsing fails, throw with text
      const body = await response.json().catch(async () => {
        const txt = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${txt}`);
      });

      // If server signalled failure or response not OK, throw
      if (!response.ok || body?.success === false) {
        const msg = body?.message || `Upload failed: ${response.status}`;
        throw new Error(msg);
      }

      const photoUrl = body?.data?.photo;
      if (!photoUrl) {
        throw new Error("Upload succeeded but no photo URL returned");
      }

      // Clear cache after successful upload
      queryClient.clear();

      return body;
    },
    onSuccess: (data) => {
      const photoUrl = data?.data?.photo;
      if (photoUrl) {
        form.setValue("imageUrl", photoUrl);
        // Replace local preview with server URL
        if (photoPreview && photoPreview.startsWith("blob:")) {
          URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(photoUrl);

        // Clear photo-related cache
        queryClient.invalidateQueries({
          queryKey: [`/api/advertising/${adId}`],
        });
        queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });

        toast({
          title: t("ads", "photoUploaded") || "Photo uploaded successfully",
          description:
            t("ads", "photoUploadDescription") || "Photo uploaded successfully",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t("ads", "uploadFailed") || "Upload failed",
        description:
          error.message || t("ads", "uploadFailed") || "Upload failed",
        variant: "destructive",
      });
      // If upload fails, remove the preview if it was a local preview
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(existingData?.imageUrl || null);
      }
    },
  });

  // Photo delete mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      if (!adId) throw new Error("Ad ID missing");
      const url = `${VITE_API_BASE_URL}/api/advertising/deletePhoto/${adId}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${TokenManager.getAccessToken()}`,
        },
      });
      queryClient.clear();
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed: ${res.status} - ${txt}`);
      }
      return res.json();
    },
    onSuccess: () => {
      // Clear preview and form value
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);
      form.setValue("imageUrl", "");

      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: [`/api/advertising/${adId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });

      toast({
        title: t("ads", "photoUploaded") || "Photo removed",
        description: t("ads", "photoUploadDescription") || "Photo removed",
      });
    },
    onError: (err: any) => {
      toast({
        title: t("ads", "uploadFailed") || "Delete failed",
        description:
          err?.message || t("ads", "uploadFailed") || "Delete failed",
        variant: "destructive",
      });
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
          title: t("ads", "invalidFileType") || "Invalid file type",
          description:
            t("ads", "selectImageFile") || "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (1MB limit)
      const ONE_MB = 1 * 1024 * 1024;
      if (file.size > ONE_MB) {
        toast({
          title: t("ads", "fileTooLarge") || "File too large",
          description:
            t("ads", "fileSizeLimit1MB") || "File size must be less than 1MB",
          variant: "destructive",
        });
        return;
      }

      // Show local preview immediately and open editor
      const localPreview = URL.createObjectURL(file);
      setPhotoPreview(localPreview);
      setEditingFile(file);
      setEditingIndex(null);
      setEditScale(1);
      setEditRotate(0);
    }
  };

  // Apply edit and upload (update flow)
  const applyEditAndUpload = async () => {
    if (!editingFile || !editorRef.current) return;
    setUploadingPhoto(true);
    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) return resolve();
          const file = new File([blob],
            // editingFile can be string (url) or File
            typeof editingFile === "string" ? "edited.png" : editingFile.name,
            { type: blob.type }
          );
          try {
            // upload and capture server response
            const result = await uploadPhotoMutation.mutateAsync(file);
            const newPhotoUrl = result?.data?.photo;
            if (newPhotoUrl) {
              if (editingIndex !== null) {
                // replace specific index
                setServerImages((prev) => {
                  const copy = [...prev];
                  copy[editingIndex] = newPhotoUrl;
                  return copy;
                });
              } else {
                // append new photo
                setServerImages((prev) => [...prev, newPhotoUrl]);
              }
              // update preview and form value
              setPhotoPreview(newPhotoUrl);
              const updated =
                editingIndex !== null
                  ? (() => {
                      const copy = [...serverImages];
                      copy[editingIndex] = newPhotoUrl;
                      return copy;
                    })()
                  : [...serverImages, newPhotoUrl];
              // keep the form value as the primary image string to satisfy zod
              form.setValue("imageUrl", updated[0] || "");
            }
          } catch (e) {
            // handled in mutation
          }
          resolve();
        }, "image/png");
      });
    } finally {
      setUploadingPhoto(false);
      setEditingFile(null);
      setEditingIndex(null);
    }
  };

  const updateAdMutation = useMutation<any, any, CreateAdData>({
    mutationFn: async (data: CreateAdData) => {
      const response = await apiRequest(
        "PUT",
        `${VITE_API_BASE_URL}/api/advertising/${adId}`,
        data
      );
      queryClient.clear();
      if (response.status === 500) {
        throw new Error("Internal Server Error (500)");
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all advertising-related cache
      clearAdCache(adId);

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
    console.log("data:", data);
    await updateAdMutation.mutateAsync(data);
  };

  return (
    <div className="flex flex-col w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("ads", "updateAdTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6
           
            ">
              <div>
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
                              {/* Photo Preview & Thumbnails */}
                              {serverImages.length > 0 && (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {serverImages.map((src, i) => (
                                      <div key={i} className="relative rounded overflow-hidden border">
                                        <img src={src} alt={`thumb-${i}`} className="w-full h-20 object-cover" />
                                        <div className="absolute top-1 right-1 flex flex-col gap-1">
                                          <Button
                                            size="xs"
                                            onClick={() => {
                                              // open editor for this image (pass url)
                                              setEditingIndex(i);
                                              setEditingFile(src);
                                              setPhotoPreview(src);
                                              setEditScale(1);
                                              setEditRotate(0);
                                            }}>
                                            Edit
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="relative">
                                    <img
                                      src={photoPreview || serverImages[0]}
                                      alt="Ad preview"
                                      className="w-full object-cover rounded-lg border"
                                    />
                                  </div>
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
                                {!editingFile ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() =>
                                        fileInputRef.current?.click()
                                      }
                                      disabled={
                                        uploadingPhoto ||
                                        uploadPhotoMutation.isPending
                                      }>
                                      {uploadingPhoto ||
                                      uploadPhotoMutation.isPending ? (
                                        <>
                                          <i className="fas fa-spinner fa-spin mx-2"></i>
                                          {t("ads", "uploading")}
                                        </>
                                      ) : (
                                        <>
                                          <i className="fas fa-upload mx-2"></i>
                                          {photoPreview
                                            ? t("ads", "changePhoto")
                                            : t("ads", "choosePhoto")}
                                        </>
                                      )}
                                    </Button>
                                    {!photoPreview && (
                                      <span className="text-sm text-muted-foreground">
                                        {t("ads", "supportedFormatsNote")}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <div className="w-full">
                                    <div className="flex gap-4 items-start">
                                      <div className="bg-muted rounded">
                                        <AvatarEditor
                                          ref={editorRef}
                                          image={editingFile}
                                          width={360}
                                          height={240}
                                          border={20}
                                          color={[255, 255, 255, 0.6]}
                                          scale={editScale}
                                          rotate={editRotate}
                                        />
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <label className="text-sm">
                                          {t("ads", "zoom")}
                                        </label>
                                        <input
                                          type="range"
                                          min="1"
                                          max="3"
                                          step="0.01"
                                          value={editScale}
                                          onChange={(e) =>
                                            setEditScale(
                                              parseFloat(e.target.value)
                                            )
                                          }
                                        />
                                        <label className="text-sm">
                                          {t("ads", "rotate")}
                                        </label>
                                        <input
                                          type="range"
                                          min="0"
                                          max="360"
                                          step="1"
                                          value={editRotate}
                                          onChange={(e) =>
                                            setEditRotate(
                                              parseInt(e.target.value)
                                            )
                                          }
                                        />
                                        <div className="flex gap-2 pt-2">
                                          <Button
                                            size="sm"
                                            onClick={applyEditAndUpload}
                                            disabled={
                                              uploadPhotoMutation.isPending ||
                                              uploadingPhoto
                                            }>
                                            {t("ads", "upload")}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setEditingFile(null);
                                              if (
                                                photoPreview &&
                                                photoPreview.startsWith("blob:")
                                              ) {
                                                URL.revokeObjectURL(
                                                  photoPreview
                                                );
                                                setPhotoPreview(
                                                  existingData?.imageUrl || null
                                                );
                                              }
                                            }}>
                                            {t("ads", "cancel")}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
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
                              placeholder={t(
                                "ads",
                                "targetAudiencePlaceholder"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cars">
                            {t("ads", "audienceCars")}
                          </SelectItem>
                          <SelectItem value="realestate">
                            {t("ads", "audienceRealestate")}
                          </SelectItem>
                          <SelectItem value="devices">
                            {t("ads", "audienceDevices")}
                          </SelectItem>
                          <SelectItem value="animals">
                            {t("ads", "audienceAnimals")}
                          </SelectItem>
                          <SelectItem value="furniture">
                            {t("ads", "audienceFurniture")}
                          </SelectItem>
                          <SelectItem value="jobs">
                            {t("ads", "audienceJobs")}
                          </SelectItem>
                          <SelectItem value="services">
                            {t("ads", "audienceServices")}
                          </SelectItem>
                          <SelectItem value="fashion">
                            {t("ads", "audienceFashion")}
                          </SelectItem>
                          <SelectItem value="games">
                            {t("ads", "audienceGames")}
                          </SelectItem>
                          <SelectItem value="rarities">
                            {t("ads", "audienceRarities")}
                          </SelectItem>
                          <SelectItem value="art">
                            {t("ads", "audienceArt")}
                          </SelectItem>
                          <SelectItem value="trips">
                            {t("ads", "audienceTrips")}
                          </SelectItem>
                          <SelectItem value="food">
                            {t("ads", "audienceFood")}
                          </SelectItem>
                          <SelectItem value="gardens">
                            {t("ads", "audienceGardens")}
                          </SelectItem>
                          <SelectItem value="occasions">
                            {t("ads", "audienceOccasions")}
                          </SelectItem>
                          <SelectItem value="tourism">
                            {t("ads", "audienceTourism")}
                          </SelectItem>
                          <SelectItem value="lost">
                            {t("ads", "audienceLost")}
                          </SelectItem>
                          <SelectItem value="coach">
                            {t("ads", "audienceCoach")}
                          </SelectItem>
                          <SelectItem value="code">
                            {t("ads", "audienceCode")}
                          </SelectItem>
                          <SelectItem value="fund">
                            {t("ads", "audienceFund")}
                          </SelectItem>
                          <SelectItem value="more">
                            {t("ads", "audienceMore")}
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
                  render={({ field }: { field: any }) => {
                    const allCityValues = locationOptions.map(
                      (city) => city.value
                    );
                    const selectedCities = (field.value as string[]) || [];
                    const isAllCitiesSelected = allCityValues.every(
                      (cityValue) => selectedCities.includes(cityValue)
                    );

                    return (
                      <FormItem>
                        <FormLabel>{t("ads", "targetCitiesLabel")}</FormLabel>
                        <div className="space-y-4">
                          {/* All Cities Option */}
                          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                            <Checkbox
                              id="all-cities"
                              checked={isAllCitiesSelected}
                              onCheckedChange={(checked: boolean) => {
                                if (checked) {
                                  // Select all individual cities
                                  const allCityValues = locationOptions.map(
                                    (city) => city.value
                                  );
                                  field.onChange(allCityValues);
                                } else {
                                  // Deselect all cities
                                  field.onChange([]);
                                }
                              }}
                            />
                            <label
                              htmlFor="all-cities"
                              className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                              <i className="fas fa-globe mx-2 text-primary"></i>
                              {t("ads", "allCities")}
                            </label>
                          </div>

                          {/* Individual Cities */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {locationOptions.map((city) => (
                              <div
                                key={city.value}
                                className="flex items-center p-2 border rounded-md transition-colors hover:bg-muted/50">
                                <Checkbox
                                  id={city.value}
                                  checked={selectedCities.includes(city.value)}
                                  onCheckedChange={(checked: boolean) => {
                                    const currentCities = selectedCities.filter(
                                      (c) => c !== "all"
                                    ); // Remove any "all" flag

                                    if (checked) {
                                      const newCities = [
                                        ...currentCities,
                                        city.value,
                                      ];
                                      field.onChange(newCities);
                                    } else {
                                      const newCities = currentCities.filter(
                                        (c: string) => c !== city.value
                                      );
                                      field.onChange(newCities);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={city.value}
                                  className="text-sm mx-2  font-medium leading-none 
                              peer-disabled:cursor-not-allowed peer-disabled:opacity-70
                               cursor-pointer flex-1">
                                  {city.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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
                            <SelectValue
                              placeholder={t("ads", "budgetTypePlaceholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="impressions">
                            {t("ads", "impressions")}
                          </SelectItem>
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
                          <FormLabel>
                            {t("ads", "instagramLinkLabel")}
                          </FormLabel>
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
                      name="phoneNumber"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>{t("ads", "phoneNumber")}</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder={t("ads", "phoneNumber")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="mb-5">
                      <FormField
                        control={form.control}
                        name="snapchatLink"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>
                              {t("ads", "snapchatLinkLabel")}
                            </FormLabel>
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
                    </div>
                    {/* <FormField
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
                /> */}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateAdMutation.isPending}
                  data-testid="button-update-ad">
                  {updateAdMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mx-2"></i>
                      {t("ads", "updatingAd")}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mx-2"></i>
                      {t("ads", "updateAdButton")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
