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

interface AdEditorUpdateProps {
  adId: string;
  existingData: any;
  isUpdate?: boolean;
}

export function AdEditor({ adId, existingData, isUpdate = false }: AdEditorUpdateProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(existingData?.imageUrl || null);

  const form = useForm<CreateAdData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      titleEn: existingData?.titleEn || "",
      titleAr: existingData?.titleAr || "",
      descriptionEn: existingData?.descriptionEn || "",
      descriptionAr: existingData?.descriptionAr || "",
      targetUrl: existingData?.targetUrl || "",
      imageUrl: existingData?.imageUrl || "",
      targetAudience: existingData?.targetAudience || "",
      budgetType: existingData?.budgetType || "impressions",
      facebookLink: existingData?.facebookLink || "",
      instagramLink: existingData?.instagramLink || "",
      tiktokLink: existingData?.tiktokLink || "",
      youtubeLink: existingData?.youtubeLink || "",
      snapchatLink: existingData?.snapchatLink || "",
      googleAdsLink: existingData?.googleAdsLink || "",
    },
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      
      const response = await fetch(`${VITE_API_BASE_URL}/api/advertising/uploadPhoto/${adId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TokenManager.getAccessToken()}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error:", response.status, errorText);
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
          title: "Photo uploaded successfully",
          description: "Your ad photo has been uploaded",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload photo",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      // If upload fails, remove the preview if it was a local preview
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(existingData?.imageUrl || null);
      }
    },
  });

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
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
      } catch (error) {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });
      queryClient.invalidateQueries({ queryKey: [`/api/advertising/${adId}`] });
      toast({
        title: "Ad updated successfully",
        description: "Your ad has been updated",
      });
      console.log(data);
      setLocation(`/campaigns/${adId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update ad",
        description: error.message || "Please try again",
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
        <CardTitle>Update Ad Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Title (English)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter ad title..."
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Title (Arabic)</FormLabel>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter ad description..."
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل وصف الإعلان..."
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Photo</FormLabel>
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
                                if (photoPreview && photoPreview.startsWith("blob:")) {
                                  URL.revokeObjectURL(photoPreview);
                                }
                                setPhotoPreview(null);
                                form.setValue("imageUrl", "");
                              }}
                            >
                              <i className="fas fa-trash mr-2"></i>
                              Remove
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
                            disabled={uploadingPhoto || uploadPhotoMutation.isPending}
                          >
                            {uploadingPhoto || uploadPhotoMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-upload mr-2"></i>
                                {photoPreview ? "Change Photo" : "Upload Photo"}
                              </>
                            )}
                          </Button>
                          {!photoPreview && (
                            <span className="text-sm text-muted-foreground">
                              JPG, PNG up to 5MB
                            </span>
                          )}
                        </div>
                        
                        {/* Hidden input for form validation */}
                        <Input type="hidden" {...field} value={field.value || ""} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Target URL */}
            <FormField
              control={form.control}
              name="targetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your target audience..."
                      className="h-20 resize-none"
                      data-testid="textarea-target-audience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Type */}
            <FormField
              control={form.control}
              name="budgetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    data-testid="select-budget-type"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="impressions">Impressions</SelectItem>
                      <SelectItem value="clicks">Clicks</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Media Links */}
            <div>
              <FormLabel className="text-base font-semibold">
                Social Media Links (Optional)
              </FormLabel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <FormField
                  control={form.control}
                  name="facebookLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook Link</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Link</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok Link</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Link</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Snapchat Link</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Ads Link</FormLabel>
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
              data-testid="button-update-ad"
            >
              {updateAdMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Updating Ad...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Update Ad
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}