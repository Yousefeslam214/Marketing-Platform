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

  // Debug logging

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
      title: (t as any).ads.uploadPhoto.errors.invalidAdId,
      description: (t as any).ads.uploadPhoto.errors.tryAgain,
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
        throw new Error((t as any).ads.uploadPhoto.errors.invalidAdId);
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
          title: (t as any).ads.uploadPhoto.success.title,
          description: (t as any).ads.uploadPhoto.success.description,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: (t as any).ads.uploadPhoto.errors.title,
        description:
          error.message || (t as any).ads.uploadPhoto.errors.uploadFailed,
        variant: "destructive",
      });
      // If upload fails, remove the preview
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
    },
  });

  const handlePhotoSelect = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: (t as any).ads.uploadPhoto.errors.invalidFileType,
          description: (t as any).ads.uploadPhoto.errors.selectImage,
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        toast({
          title: (t as any).ads.uploadPhoto.errors.fileTooLarge.replace(
            "{size}",
            "5MB"
          ),
          description: (t as any).ads.uploadPhoto.errors.currentSize.replace(
            "{size}",
            `${(file.size / 1024 / 1024).toFixed(2)}MB`
          ),
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
        toast({
          title: (t as any).ads.uploadPhoto.errors.uploadFailed,
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
        title: (t as any).ads.uploadPhoto.errors.photoRequired,
        description: (t as any).ads.uploadPhoto.errors.uploadBeforeContinue,
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
          title={(t as any).ads.uploadPhoto.header.title}
          description={(t as any).ads.uploadPhoto.header.description}
        />

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-camera text-blue-600"></i>
                  {(t as any).ads.uploadPhoto.card.title}
                </CardTitle>
                <p className="text-muted-foreground">
                  {(t as any).ads.uploadPhoto.card.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt={(t as any).ads.uploadPhoto.preview.alt}
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
                        {(t as any).ads.uploadPhoto.buttons.remove}
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
                            {(t as any).ads.uploadPhoto.uploadArea.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {(t as any).ads.uploadPhoto.uploadArea.description}
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
                        }
                        className="w-full sm:w-auto">
                        {uploadingPhoto || uploadPhotoMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            {(t as any).ads.uploadPhoto.buttons.uploading}
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload mr-2"></i>
                            {photoPreview
                              ? (t as any).ads.uploadPhoto.buttons.change
                              : (t as any).ads.uploadPhoto.buttons.choose}
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground">
                        {(t as any).ads.uploadPhoto.uploadArea.fileSupport}
                      </p>
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                      {(t as any).ads.uploadPhoto.guidelines.title}
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• {(t as any).ads.uploadPhoto.guidelines.highRes}</li>
                      <li>
                        • {(t as any).ads.uploadPhoto.guidelines.goodLighting}
                      </li>
                      <li>
                        • {(t as any).ads.uploadPhoto.guidelines.avoidText}
                      </li>
                      <li>
                        •{" "}
                        {(t as any).ads.uploadPhoto.guidelines.relateToAudience}
                      </li>
                    </ul>
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
                      {(t as any).ads.uploadPhoto.buttons.continue}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                      disabled={
                        uploadingPhoto || uploadPhotoMutation.isPending
                      }>
                      {(t as any).ads.uploadPhoto.buttons.skip}
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
