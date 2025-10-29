import { useState, useRef, ChangeEvent } from "react";
import AvatarEditor from "react-avatar-editor";
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
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[] | null>(null);

  // Multiple selection + edit support
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editedFiles, setEditedFiles] = useState<Map<number, File>>(new Map());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const editorRef = useRef<any>(null);
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);

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
        // push to uploaded urls list
        setUploadedPhotoUrls((prev) => [...(prev || []), photoUrl]);
        // Replace local main preview with server URL if it was a blob
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

  // Mutation to upload multiple photos in one request
  const uploadPhotosMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!adId) throw new Error("Ad ID is missing");

      const formData = new FormData();
      files.forEach((f) => formData.append("photo", f));

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
      // Expecting the API to return an array of uploaded photo urls or a single photo
      const photos = data.data?.photos || data.data?.photo ? [data.data?.photo].flat() : [];
      if (photos && photos.length) {
        setUploadedPhotoUrls((prev) => [...(prev || []), ...photos]);
        // replace previews with server URLs where appropriate: use first as main preview
        if (photos[0]) {
          if (photoPreview && photoPreview.startsWith("blob:")) {
            URL.revokeObjectURL(photoPreview);
          }
          setPhotoPreview(photos[0]);
        }
        // Revoke local preview URLs and clear staged previews
        selectedPreviews.forEach((p) => {
          if (p && p.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        setSelectedFiles([]);
        setSelectedPreviews([]);
        setEditedFiles(new Map());
        toast({
          title: "Upload Successful",
          description: "Your photos have been uploaded successfully.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description:
          error.message || "An error occurred while uploading your photos.",
        variant: "destructive",
      });
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
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed: ${res.status} - ${txt}`);
      }
      return await res.json();
    },
    onSuccess: () => {
      // Clear server photo and preview
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);
      setUploadedPhotoUrls(null);
      toast({
        title: t("uploadPhoto", "uploadSuccess"),
        description: t("uploadPhoto", "uploadSuccessDesc"),
      });
    },
    onError: (err) => {
      toast({
        title: t("uploadPhoto", "uploadFailed"),
        description:
          (err as Error).message || t("uploadPhoto", "uploadFailedDesc"),
        variant: "destructive",
      });
    },
  });

  const handlePhotoSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate and accept files for staged upload
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("uploadPhoto", "Invalid file type"),
          description: t("uploadPhoto", "Please select an image file"),
          variant: "destructive",
        });
        continue;
      }
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
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create previews and stage files for editing/upload
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setSelectedPreviews((prev) => [...prev, ...newPreviews]);
    // if there's no main photo preview yet, set it from the first newly added
    if (!photoPreview) {
      setPhotoPreview(newPreviews[0]);
    }
    // If only one file was added, open editor for it
    if (validFiles.length === 1) {
      setEditingIndex((prev) => (prev === null ? selectedFiles.length : prev));
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setScale(1);
    setRotate(0);
  };

  const applyEdit = async () => {
    if (editingIndex == null || !editorRef.current) return;
    const canvas = editorRef.current.getImageScaledToCanvas();
    await new Promise<void>((resolve) => {
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return resolve();
        const original = selectedFiles[editingIndex];
        const file = new File([blob], original?.name || "edited.png", {
          type: blob.type,
        });
        setEditedFiles((m) => {
          const copy = new Map(m);
          copy.set(editingIndex, file);
          return copy;
        });
        // update preview for that index
        const preview = URL.createObjectURL(file);
        setSelectedPreviews((p) => {
          const copy = [...p];
          // revoke previous preview
          if (copy[editingIndex] && copy[editingIndex].startsWith("blob:")) {
            URL.revokeObjectURL(copy[editingIndex]);
          }
          copy[editingIndex] = preview;
          return copy;
        });
        resolve();
      }, "image/png");
    });
    setEditingIndex(null);
  };

  const removeSelected = (index: number) => {
    setSelectedFiles((s) => s.filter((_, i) => i !== index));
    setEditedFiles((m) => {
      const copy = new Map(m);
      copy.delete(index);
      return copy;
    });
    setSelectedPreviews((p) => {
      const copy = [...p];
      const removed = copy.splice(index, 1)[0];
      if (removed && removed.startsWith("blob:")) URL.revokeObjectURL(removed);
      return copy;
    });
    // clear main preview if no staged previews exist
    setPhotoPreview((prev) => {
      if (selectedPreviews.length <= 1) return null;
      return selectedPreviews[0] || prev;
    });
  };

  const uploadAllSelected = async () => {
    if (selectedFiles.length === 0) return;
    setUploadingPhoto(true);
    try {
      // Prepare files: prefer edited file for each index
      const filesToUpload: File[] = selectedFiles.map((f, i) => editedFiles.get(i) || f);
      await uploadPhotosMutation.mutateAsync(filesToUpload);
    } finally {
      setUploadingPhoto(false);
      // Note: onSuccess will clear staged files and revoke previews
    }
  };

  const handleContinue = () => {
    if (uploadedPhotoUrls && uploadedPhotoUrls.length > 0) {
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
                          if (uploadedPhotoUrls) {
                            // call API to delete server photo
                            deletePhotoMutation.mutate();
                            return;
                          }

                          if (
                            photoPreview &&
                            photoPreview.startsWith("blob:")
                          ) {
                            URL.revokeObjectURL(photoPreview);
                          }
                          setPhotoPreview(null);
                          setUploadedPhotoUrls(null);
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
                            {t("uploadPhoto", "Uploading...")}
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

                    {/* Staged thumbnails + edit controls */}
                    {selectedPreviews.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          {t("uploadPhoto", "Staged Photos")}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedPreviews.map((p, i) => (
                            <div key={i} className="relative rounded overflow-hidden border">
                              <img
                                src={p}
                                alt={`preview-${i}`}
                                className="w-full h-28 object-cover"
                              />
                              <div className="absolute top-2 right-2 flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => startEditing(i)}>
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeSelected(i)}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3 mt-3">
                          <Button
                            onClick={uploadAllSelected}
                            disabled={
                              uploadingPhoto || uploadPhotosMutation.isPending || selectedPreviews.length === 0
                            }
                            className="flex-1">
                            {uploadingPhoto || uploadPhotosMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2" />
                                {t("uploadPhoto", "Uploading...")}
                              </>
                            ) : (
                              <>
                                <i className="fas fa-upload mr-2" />
                                {t("uploadPhoto", "Upload All")}
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // clear staged previews
                              selectedPreviews.forEach((p) => {
                                if (p && p.startsWith("blob:")) URL.revokeObjectURL(p);
                              });
                              setSelectedFiles([]);
                              setSelectedPreviews([]);
                              setEditedFiles(new Map());
                            }}
                            disabled={uploadingPhoto || uploadPhotosMutation.isPending}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Avatar editor modal/area */}
                    {editingIndex !== null && selectedPreviews[editingIndex] && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-2">{t("uploadPhoto", "Edit Photo")}</h4>
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                          <div>
                            <AvatarEditor
                              ref={editorRef}
                              image={selectedPreviews[editingIndex]}
                              width={320}
                              height={200}
                              border={40}
                              scale={scale}
                              rotate={rotate}
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-sm mb-2">{t("uploadPhoto", "Zoom")}</label>
                            <input
                              type="range"
                              min={1}
                              max={2}
                              step={0.01}
                              value={scale}
                              onChange={(e) => setScale(Number(e.target.value))}
                              className="w-full"
                            />

                            <label className="block text-sm mt-3 mb-2">{t("uploadPhoto", "Rotate")}</label>
                            <input
                              type="range"
                              min={0}
                              max={360}
                              step={1}
                              value={rotate}
                              onChange={(e) => setRotate(Number(e.target.value))}
                              className="w-full"
                            />

                            <div className="flex gap-2 mt-4">
                              <Button onClick={applyEdit}>{t("uploadPhoto", "Save")}</Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingIndex(null)}>
                                {t("uploadPhoto", "Cancel")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  {/* Guidelines */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                      {t("uploadPhoto", "Photo Guidelines")}
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• {t("uploadPhoto", "High Resolution")}</li>
                      <li>• {t("uploadPhoto", "Good Lighting")}</li>
                      <li>• {t("uploadPhoto", "Avoid Text")}</li>
                      <li>• {t("uploadPhoto", "Relate to Your Audience")}</li>
                      <li>
                        •{" "}
                        {t(
                          "uploadPhoto",
                          "Ensure your photo is less than 1MB in size"
                        )}
                      </li>
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
                          {t("uploadPhoto", "Uploading...")}
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

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleContinue}
                      disabled={
                        !uploadedPhotoUrls ||
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
