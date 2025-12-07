import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";

interface PhotoEditState {
  preview: string | null;
  file: File | null;
  isBlob: boolean;
  isAdd: boolean;
  scale: number;
  rotate: number;
}

interface ApiResponse {
  data?: {
    imageUrl?: string | string[];
    photos?: any[] | any;
    photo?: string | string[];
  };
}

export default function EditPhoto() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  const navState = useMemo(() => (window.history.state as any) || {}, []);
  const initialImgData = useMemo(() => navState?.imgData || [], [navState]);

  const [photoList, setPhotoList] = useState<string[]>(initialImgData);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editState, setEditState] = useState<PhotoEditState>({
    preview: null,
    file: null,
    isBlob: false,
    isAdd: false,
    scale: 1,
    rotate: 0,
  });

  const adId = useMemo(() => window.location.pathname.split("/")[2], []);

  const parsePhotoResponse = useCallback((data: ApiResponse): string[] => {
    if (!data?.data) return [];

    const { imageUrl, photos, photo } = data.data;

    if (imageUrl) {
      return Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    }
    if (photos) {
      return Array.isArray(photos)
        ? photos.map((p: any) => (p?.url ? p.url : p))
        : [photos];
    }
    if (photo) {
      return Array.isArray(photo) ? photo : [photo];
    }

    return [];
  }, []);

  const updatePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedUrl) throw new Error("No photo selected for replacement");

      const formData = new FormData();
      formData.append("photo", file);

      const url = `${VITE_API_BASE_URL}/api/advertising/updatePhoto/${adId}?photoUrl=${encodeURIComponent(
        selectedUrl
      )}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${TokenManager.getAccessToken()}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data) => {
      const photos = parsePhotoResponse(data);
      const newUrl = photos[0];

      if (newUrl && selectedUrl) {
        setPhotoList((prev) =>
          prev.map((p) => (p === selectedUrl ? newUrl : p))
        );
        toast({
          title: "Photo Updated",
          description: "Your photo was replaced successfully.",
        });
        resetSelection();
      }
    },
    onError: (err) => {
      toast({
        title: "Error Updating Photo",
        description: err.message || "Upload failed",
        variant: "destructive",
      });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      const url = `${VITE_API_BASE_URL}/api/advertising/deletePhoto/${adId}?photoUrl=${encodeURIComponent(
        photoUrl
      )}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${TokenManager.getAccessToken()}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      return true;
    },
    onSuccess: (_, photoUrl) => {
      setPhotoList((prev) => prev.filter((p) => p !== photoUrl));
      toast({
        title: t("editPhoto", "Photo Deleted"),
        description: t("editPhoto", "Photo removed."),
      });
    },
    onError: (err) => {
      toast({
        title: t("editPhoto", "Error Deleting Photo"),
        description: err.message || t("editPhoto", "Could not delete photo"),
        variant: "destructive",
      });
    },
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!adId) throw new Error("Ad ID is missing");

      const formData = new FormData();
      files.forEach((f) => formData.append("photo", f));

      const url = `${VITE_API_BASE_URL}/api/advertising/uploadPhoto/${adId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TokenManager.getAccessToken()}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      const photos = parsePhotoResponse(data);
      if (photos.length) {
        setPhotoList((prev) => [...prev, ...photos]);
        toast({
          title: t("editPhoto", "Photos Uploaded"),
          description: t("editPhoto", "New photos added."),
        });
      }
    },
    onError: (err) => {
      toast({
        title: t("editPhoto", "Upload Failed"),
        description: err.message || t("editPhoto", "Failed to upload photos"),
        variant: "destructive",
      });
    },
  });

  const resetSelection = useCallback(() => {
    setSelectedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const cleanupBlobUrl = useCallback((url: string | null) => {
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn("Failed to revoke blob URL:", e);
      }
    }
  }, []);

  // Initialize with first photo only if we're not editing
  useEffect(() => {
    if (!isEditing && photoList.length > 0 && !editState.preview) {
      setSelectedUrl(photoList[0]);
    }
  }, [isEditing, photoList, editState.preview]);

  useEffect(() => {
    return () => {
      if (editState.preview && editState.isBlob) {
        cleanupBlobUrl(editState.preview);
      }
    };
  }, [editState.preview, editState.isBlob, cleanupBlobUrl]);

  const handleReplaceClick = useCallback((url: string) => {
    setSelectedUrl(url);
    setEditState((prev) => ({ ...prev, isAdd: false }));
    fileInputRef.current?.click();
  }, []);

  const handleEditClick = useCallback((url: string) => {
    setSelectedUrl(url);
    setEditState({
      preview: url,
      file: null,
      isBlob: false,
      isAdd: false,
      scale: 1,
      rotate: 0,
    });
    setIsEditing(true);
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select images smaller than 5MB",
          variant: "destructive",
        });
        return false;
      }
      return true;
    },
    [toast]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Only allow one photo
      const file = files[0];
      if (!file || !validateFile(file)) return;

      const preview = URL.createObjectURL(file);
      cleanupBlobUrl(editState.preview);

      // Replace flow - always replace since only one photo allowed
      if (selectedUrl) {
        setEditState((prev) => ({
          ...prev,
          preview,
          file,
          isBlob: true,
          isAdd: false,
        }));
      } else {
        // Add flow - but will replace existing since only one allowed
        setEditState({
          preview,
          file,
          isBlob: true,
          isAdd: photoList.length === 0, // Only add if no photos exist
          scale: 1,
          rotate: 0,
        });
        if (photoList.length > 0) {
          // If photo exists, set it as selected for replacement
          setSelectedUrl(photoList[0]);
          setEditState((prev) => ({ ...prev, isAdd: false }));
        }
      }
      setIsEditing(true);
    },
    [selectedUrl, validateFile, editState.preview, cleanupBlobUrl, photoList]
  );

  const applyEditAndReplace = useCallback(async () => {
    if (!editorRef.current || (!selectedUrl && !editState.isAdd)) {
      toast({
        title: "Error",
        description: "No image to save",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = editorRef.current.getImageScaledToCanvas();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create image blob"));
        }, "image/png");
      });

      const fileName = editState.file?.name || "edited.png";
      const file = new File([blob], fileName, { type: blob.type });

      if (editState.isAdd) {
        await uploadPhotosMutation.mutateAsync([file]);
      } else {
        await updatePhotoMutation.mutateAsync(file);
      }

      // Cleanup and reset
      cleanupBlobUrl(editState.preview);
      setEditState({
        preview: null,
        file: null,
        isBlob: false,
        isAdd: false,
        scale: 1,
        rotate: 0,
      });
      setIsEditing(false);
      resetSelection();
    } catch (err: any) {
      console.error("Edit failed:", err);

      // Handle CORS issues for external images
      if (!editState.isBlob && editState.preview) {
        try {
          const response = await fetch(editState.preview);
          if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          setEditState((prev) => ({
            ...prev,
            preview: blobUrl,
            isBlob: true,
          }));

          toast({
            title: "Retry Edit",
            description: "Image loaded locally - please Save again.",
          });
          return;
        } catch (fetchErr) {
          console.error("Fetch fallback failed:", fetchErr);
        }
      }

      toast({
        title: "Edit Failed",
        description: err?.message || "Unable to export edited image",
        variant: "destructive",
      });
    }
  }, [
    selectedUrl,
    editState,
    updatePhotoMutation,
    uploadPhotosMutation,
    cleanupBlobUrl,
    resetSelection,
    toast,
  ]);

  const cancelEdit = useCallback(() => {
    cleanupBlobUrl(editState.preview);
    setEditState({
      preview: null,
      file: null,
      isBlob: false,
      isAdd: false,
      scale: 1,
      rotate: 0,
    });
    setIsEditing(false);
    resetSelection();
  }, [editState.preview, cleanupBlobUrl, resetSelection]);

  const handleDelete = useCallback(
    (url: string) => {
      if (photoList.length <= 1) {
        toast({
          title: "Cannot Delete",
          description: "You must have at least one photo for your ad.",
          variant: "destructive",
        });
        return;
      }
      deletePhotoMutation.mutate(url);
    },
    [deletePhotoMutation, photoList.length, toast]
  );

  const handleAddNewPhoto = useCallback(() => {
    setSelectedUrl(null);
    fileInputRef.current?.click();
  }, []);

  // Memoized photo grid
  const photoGrid = useMemo(
    () => (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photoList.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative rounded border overflow-hidden group">
            <img
              src={url}
              alt={`photo-${index}`}
              className="w-full h-36 object-cover"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2 transition">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleEditClick(url)}>
                {t("editPhoto", "Edit")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleReplaceClick(url)}>
                {t("editPhoto", "Replace")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    ),
    [photoList, handleEditClick, handleReplaceClick, t]
  );

  // Memoized editor controls - ONLY show when actively editing
  const editorControls = useMemo(() => {
    if (!isEditing || !editState.preview) return null;

    return (
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm mb-2">
            {t("uploadPhoto", "Zoom")}
          </label>
          <input
            type="range"
            min={0.3}
            max={2}
            step={0.05}
            value={editState.scale}
            onChange={(e) =>
              setEditState((prev) => ({
                ...prev,
                scale: Number(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">
            {t("uploadPhoto", "Rotate")}
          </label>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={editState.rotate}
            onChange={(e) =>
              setEditState((prev) => ({
                ...prev,
                rotate: Number(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={applyEditAndReplace}
            disabled={
              updatePhotoMutation.isPending || uploadPhotosMutation.isPending
            }>
            {t("editPhoto", "Save")}
          </Button>
          <Button variant="outline" onClick={cancelEdit}>
            {t("editPhoto", "Cancel")}
          </Button>
        </div>
      </div>
    );
  }, [
    isEditing,
    editState.preview,
    editState.scale,
    editState.rotate,
    applyEditAndReplace,
    cancelEdit,
    t,
    updatePhotoMutation.isPending,
    uploadPhotosMutation.isPending,
  ]);

  // Memoized editor section - ONLY show when actively editing
  const editorSection = useMemo(() => {
    if (!isEditing || !editState.preview) return null;

    return (
      <div className="mt-4 p-4 border rounded-lg">
        <h4 className="font-medium mb-2">{t("editPhoto", "Edit Photo")}</h4>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div>
            <AvatarEditor
              ref={editorRef}
              image={editState.preview}
              width={320}
              height={200}
              border={40}
              scale={editState.scale}
              rotate={editState.rotate}
              crossOrigin="anonymous"
            />
          </div>
          {editorControls}
        </div>
      </div>
    );
  }, [
    isEditing,
    editState.preview,
    editState.scale,
    editState.rotate,
    editorControls,
    t,
  ]);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("editPhoto", "Edit Photos")}
          description={t(
            "editPhoto",
            "Manage, replace, or delete your ad photos"
          )}
        />
        <main className="p-6 mt-24">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{t("editPhoto", "Your Ad Photos")}</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />

                {photoList.length === 0 ? (
                  <p className="text-muted-foreground">
                    {t("editPhoto", "Nophotosuploadedyet")}
                  </p>
                ) : (
                  photoGrid
                )}

                {/* Only show editor when actively editing */}
                {editorSection}

                <div className="mt-6 flex justify-between">
                  {photoList.length === 0 && (
                    <Button onClick={handleAddNewPhoto}>
                      <i className="fas fa-plus mx-2"></i>
                      {t("editPhoto", "Add Photo")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/campaigns/${adId}`)}>
                    {t("editPhoto", "Done")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
