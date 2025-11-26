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
  // Keep photoPreview as an array so multiple staged or uploaded photos are shown
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  // Multiple selection + edit support
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editedFiles, setEditedFiles] = useState<Map<number, File>>(new Map());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const editorRef = useRef<any>(null);
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);

  if (!match) {
    setLocation("/campaigns");
    return null;
  }

  const adId = params?.adId;
  if (!adId) {
    toast({
      title: t("uploadPhoto", "invalidAd"),
      description: t("uploadPhoto", "noAdIdProvided"),
      variant: "destructive",
    });
    setLocation("/campaigns");
    return null;
  }

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
        // If previous previews were blobs, revoke them when replaced by server URL
        setPhotoPreview((prev) => {
          // revoke any local blob URLs we've replaced
          prev.forEach((p) => {
            if (p && p.startsWith("blob:")) URL.revokeObjectURL(p);
          });
          return [...prev, photoUrl];
        });
        toast({
          title: t("uploadPhoto", "uploadSuccess"),
          description: t("uploadPhoto", "photoUploadedSuccess"),
        });
      }
    },
    onError: (error) => {
      toast({
        title: t("uploadPhoto", "uploadFailed"),
        description: error.message || t("uploadPhoto", "errorUploadingPhoto"),
        variant: "destructive",
      });
      // If upload fails, remove the preview
      // remove any staged blob previews
      setPhotoPreview((prev) => {
        const remaining = prev.filter((p) => !(p && p.startsWith("blob:")));
        prev.forEach((p) => {
          if (p && p.startsWith("blob:")) URL.revokeObjectURL(p);
        });
        return remaining;
      });
    },
  });

  // Mutation to upload multiple photos in one request
  const uploadPhotosMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!adId) throw new Error("Ad ID is missing");

      const formData = new FormData();
      files.forEach((f) => formData.append("photo", f));

      const uploadUrl = `${VITE_API_BASE_URL}/api/advertising/uploadPhoto/${adId}`;
      console.log("formData:", formData);
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
      console.log("photos uploaded:", data);
      // Extract server-returned image URLs. API may return data.imageUrl (array), data.photos (array) or data.photo (string)
      let photos: string[] = [];
      if (data?.data?.imageUrl) {
        photos = Array.isArray(data.data.imageUrl)
          ? data.data.imageUrl
          : [data.data.imageUrl];
      } else if (data?.data?.photos) {
        photos = Array.isArray(data.data.photos)
          ? data.data.photos
          : [data.data.photos];
      } else if (data?.data?.photo) {
        photos = Array.isArray(data.data.photo)
          ? data.data.photo
          : [data.data.photo];
      }

      if (photos && photos.length) {
        // Revoke any staged blob previews that were part of selectedPreviews
        selectedPreviews.forEach((p) => {
          if (p && p.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(p);
            } catch (e) {
              /* ignore */
            }
          }
        });

        // Update main preview list: remove staged blob previews, keep server urls and existing server urls, then append new server urls
        setPhotoPreview((prev) => {
          const filtered = prev.filter(
            (p) => !(p && p.startsWith("blob:") && selectedPreviews.includes(p))
          );
          return [...filtered, ...photos];
        });

        // Clear staged selections and edited map
        setSelectedFiles([]);
        setSelectedPreviews([]);
        setEditedFiles(new Map());

        toast({
          title: t("uploadPhoto", "uploadSuccess"),
          description: t("uploadPhoto", "photosUploadedSuccess"),
        });
      }
    },
    onError: (error) => {
      toast({
        title: t("uploadPhoto", "uploadFailed"),
        description: error.message || t("uploadPhoto", "errorUploadingPhotos"),
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
    // Append staged previews to the main photoPreview array so multiple previews are kept
    setPhotoPreview((prev) => [...prev, ...newPreviews]);
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
    // remove selected staged file + preview + any edited file mapping
    const removedPreview = selectedPreviews[index];
    setSelectedFiles((s) => s.filter((_, i) => i !== index));
    setEditedFiles((m) => {
      const copy = new Map(m);
      copy.delete(index);
      return copy;
    });
    setSelectedPreviews((p) => {
      const copy = [...p];
      copy.splice(index, 1);
      return copy;
    });
    // revoke and remove from main preview list
    if (removedPreview && removedPreview.startsWith("blob:")) {
      URL.revokeObjectURL(removedPreview);
    }
    setPhotoPreview((prev) => prev.filter((p) => p !== removedPreview));
  };

  const uploadAllSelected = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: t("uploadPhoto", "No Photos Selected"),
        description: t("uploadPhoto", "Please upload at least one photo for your ad"),
        variant: "destructive",
      });
      return;
    }
    setUploadingPhoto(true);
    try {
      // Prepare files: prefer edited file for each index
      const filesToUpload: File[] = selectedFiles.map(
        (f, i) => editedFiles.get(i) || f
      );
      await uploadPhotosMutation.mutateAsync(filesToUpload);
      setLocation(`/ads/${params.adId}/assign-credit`);
    } catch (e) {
      toast({
        title: t("uploadPhoto", "uploadFailed"),
        description: t("uploadPhoto", "errorUploadingPhotosGeneric"),
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      // Note: onSuccess will clear staged files and revoke previews
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
                  {/* Staged thumbnails + edit controls */}
                  {selectedPreviews.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">
                        {t("uploadPhoto", "stagedPhotos")}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedPreviews.map((p, i) => (
                          <div
                            key={i}
                            className="relative rounded overflow-hidden border">
                            <img
                              src={p}
                              alt={`preview-${i}`}
                              className="w-full h-28 object-cover"
                            />
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                              <Button size="sm" onClick={() => startEditing(i)}>
                                {t("uploadPhoto", "edit")}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeSelected(i)}>
                                {t("uploadPhoto", "remove")}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 mt-3"></div>
                    </div>
                  )}

                  {/* Avatar editor modal/area */}
                  {editingIndex !== null && selectedPreviews[editingIndex] && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium mb-2">
                        {t("uploadPhoto", "editPhoto")}
                      </h4>
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
                          <label className="block text-sm mb-2">
                            {t("uploadPhoto", "zoom")}
                          </label>
                          <input
                            type="range"
                            min={1}
                            max={2}
                            step={0.01}
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            className="w-full"
                          />

                          <label className="block text-sm mt-3 mb-2">
                            {t("uploadPhoto", "rotate")}
                          </label>
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
                            <Button onClick={applyEdit}>
                              {t("uploadPhoto", "save")}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingIndex(null)}>
                              {t("uploadPhoto", "cancel")}
                            </Button>
                          </div>
                        </div>
                      </div>
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
                            <i className="fas fa-spinner fa-spin mx-2"></i>
                            {t("uploadPhoto", "Uploading...")}
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload mx-2"></i>
                            {photoPreview
                              ? t("uploadPhoto", "uploadmorePhotos")
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
                  <div className="mt-4 space-y-2"></div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={uploadAllSelected}
                      disabled={
                        uploadingPhoto ||
                        uploadPhotosMutation.isPending ||
                        selectedPreviews.length === 0
                      }
                      className="flex-1">
                      <i className="fas fa-arrow-right mx-2"></i>
                      {t("uploadPhoto", "Continue")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // clear staged previews
                        selectedPreviews.forEach((p) => {
                          if (p && p.startsWith("blob:"))
                            URL.revokeObjectURL(p);
                        });
                        setSelectedFiles([]);
                        setSelectedPreviews([]);
                        setEditedFiles(new Map());
                      }}
                      disabled={
                        uploadingPhoto || uploadPhotosMutation.isPending
                      }>
                      {t("uploadPhoto", "clear")}
                    </Button>
                    {/* <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                      disabled={
                        uploadingPhoto || uploadPhotoMutation.isPending
                      }>
                      {t("uploadPhoto", "Skip")}
                    </Button> */}
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
