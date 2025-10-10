import { useState, useRef, ChangeEvent } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";

export default function UploadPhoto() {
  const [match, params] = useRoute("/ads/:adId/upload-photo");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  if (!match) {
    setLocation("/campaigns");
    return null;
  }

  if (!params?.adId) {
    toast({
      title: "Invalid Ad",
      description: "No Ad ID provided in the URL",
      variant: "destructive",
    });
    setLocation("/campaigns");
    return null;
  }

  const adId = params.adId;

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!adId) {
        throw new Error("Ad ID is missing");
      }

      const formData = new FormData();
      formData.append("photo", file);

      const uploadUrl = `${VITE_API_BASE_URL}/api/advertising/uploadPhoto/${adId}`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TokenManager.getAccessToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return result;
    },
    onSuccess: (data) => {
      const photoUrl = data.data?.photo;
      if (photoUrl) {
        setUploadedPhotoUrl(photoUrl);
        // Replace local preview with server URL
        if (photoPreview && photoPreview.startsWith("blob:")) {
          URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(photoUrl);
        toast({
          title: "Upload Successful",
          description: "Your photo has been uploaded successfully.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description:
          error.message || "An error occurred while uploading your photo.",
        variant: "destructive",
      });
      // If upload fails, remove the preview
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
    },
  });

  const handlePhotoSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("uploadPhoto", "Invalid file type"),
          description: t(
            "uploadPhoto",
            "Please select an image file"
          ),
          variant: "destructive",
        });
        return;
      }

      // Validate file size (1MB limit)
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSizeInBytes) {
        const sizeStr = (file.size / 1024 / 1024).toFixed(2);
        const raw = t(
          "uploadPhoto",
          "Please select an image smaller than 1MB. Current size: {size}MB"
        );
        toast({
          title: t("uploadPhoto", "File too large"),
          description: raw.replace("{size}", sizeStr),
          variant: "destructive",
        });
        return;
      }

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPhotoPreview(localPreview);
      const sizeStr = (file.size / 1024 / 1024).toFixed(2);
      const currentRaw = t(
        "uploadPhoto",
        "Current file size: {size}MB"
      );
      toast({
        title: t("uploadPhoto", "File Selected"),
        description: currentRaw.replace("{size}", sizeStr),
      });

      setUploadingPhoto(true);
      try {
        await uploadPhotoMutation.mutateAsync(file);
      } catch (error) {
        // Error handled in mutation onError, but show fallback message
        toast({
          title: t("uploadPhoto", "Upload Failed"),
          variant: "destructive",
          description: error instanceof Error ? error.message : "",
        });
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleContinue = () => {
    if (uploadedPhotoUrl) {
      setLocation(`/ads/${params.adId}/assign-credit`);
    } else {
      toast({
        title: "Photo Required",
        description: "Please upload a photo before continuing.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    setLocation(`/ads/${params.adId}/assign-credit`);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <Header
          title={t("uploadPhoto", "Upload Ad Photo")}
          description={t("uploadPhoto", "Please upload a photo for your ad")}
        />

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-camera text-blue-600"></i>
                  {t("uploadPhoto", "Upload Photo")}
                </CardTitle>
                <p className="text-muted-foreground">
                  {t("uploadPhoto", "Please upload a photo for your ad")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt={t("uploadPhoto", "PhotoPreview")}
                        className="w-full max-w-md mx-auto h-64 object-cover rounded-lg border shadow-sm"
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
                          setUploadedPhotoUrl(null);
                        }}>
                        <i className="fas fa-trash mr-2"></i>
                        {t("uploadPhoto", "RemovePhoto")}
                      </Button>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />

                    {!photoPreview && (
                      <div className="space-y-4">
                        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                        <div>
                          <h3 className="text-lg font-medium">
                            {t("uploadPhoto", "Upload a Photo")}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t(
                              "uploadPhoto",
                              "Please upload a photo for your ad"
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      <Button
                        type="button"
                        variant={photoPreview ? "outline" : "default"}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={
                          uploadingPhoto || uploadPhotoMutation.isPending
                        }>
                        {uploadingPhoto || uploadPhotoMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            {t(
                              "uploadPhoto",
                              "Uploading..."
                            )}
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload mr-2"></i>
                            {photoPreview
                              ? t("uploadPhoto", "Change Photo")
                              : t("uploadPhoto", "Choose Photo")}
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground">
                        {t("uploadPhoto", "Supports: JPG, PNG, GIF")}
                      </p>
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                      {t(
                        "uploadPhoto",
                        "Photo Guidelines"
                      )}
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• {t("uploadPhoto", "High Resolution")}</li>
                      <li>• {t("uploadPhoto", "Good Lighting")}</li>
                      <li>• {t("uploadPhoto", "Avoid Text")}</li>
                      <li>• {t("uploadPhoto", "Relate to Your Audience")}</li>
                        <li>• {t("uploadPhoto", "Ensure your photo is less than 1MB in size")}</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}

                  <div className="mt-4 space-y-2">
                    <Button
                      type="button"
                      variant={photoPreview ? "outline" : "default"}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto || uploadPhotoMutation.isPending}
                      className="w-full sm:w-auto">
                      {uploadingPhoto || uploadPhotoMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          {t(
                            "uploadPhoto",
                            "Uploading..."
                          )}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload mr-2"></i>
                          {photoPreview
                            ? t(
                                "uploadPhoto",
                                "Change Photo"
                              )
                            : t(
                                "uploadPhoto",
                                "Choose Photo"
                              )}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      {t("uploadPhoto", "Supports: JPG, PNG, GIF")}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleContinue}
                      disabled={
                        !uploadedPhotoUrl ||
                        uploadingPhoto ||
                        uploadPhotoMutation.isPending
                      }
                      className="flex-1">
                      <i className="fas fa-arrow-right mr-2"></i>
                      {t("uploadPhoto", "Continue")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                      disabled={
                        uploadingPhoto || uploadPhotoMutation.isPending
                      }>
                      {t("uploadPhoto", "Skip")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
