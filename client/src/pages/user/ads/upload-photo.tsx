import { useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function UploadPhoto() {
  const [match, params] = useRoute("/ads/:adId/upload-photo");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  if (!match || !params?.adId) {
    setLocation("/ads");
    return null;
  }

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(
        `${VITE_API_BASE_URL}/api/advertising/uploadPhoto/${params.adId}`,
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
        console.error("Upload error:", response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      return response.json();
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
      // If upload fails, remove the preview
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
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
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (1MB limit)
      if (file.size > 1 * 1020 * 1020) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 1MB",
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

  const handleContinue = () => {
    if (uploadedPhotoUrl) {
      setLocation(`/ads/${params.adId}/assign-credit`);
    } else {
      toast({
        title: "Photo required",
        description: "Please upload a photo before continuing",
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
          title="Upload Ad Photo"
          description="Add an eye-catching photo to your advertisement"
        />

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-camera text-blue-600"></i>
                  Upload Your Ad Photo
                </CardTitle>
                <p className="text-muted-foreground">
                  Add a compelling image to make your ad more attractive and
                  engaging.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Ad preview"
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
                        Remove
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
                            Upload your ad photo
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Choose a high-quality image that represents your ad
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
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload mr-2"></i>
                            {photoPreview ? "Change Photo" : "Choose Photo"}
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground">
                        Supports JPG, PNG up to 1MB
                      </p>
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                      Photo Guidelines:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Use high-resolution images (minimum 800x600px)</li>
                      <li>• Ensure good lighting and clear visibility</li>
                      <li>• Avoid text-heavy images</li>
                      <li>• Use images that relate to your target audience</li>
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
                      Continue to Credit Assignment
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                      disabled={
                        uploadingPhoto || uploadPhotoMutation.isPending
                      }>
                      Skip Photo
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
