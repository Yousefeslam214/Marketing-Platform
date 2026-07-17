import { useState, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";

interface ApiResponse {
  data?: {
    imageUrl?: string | string[];
    photos?: any[] | any;
    photo?: string | string[];
  };
}

export default function EditPhoto() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navState = useMemo(() => (window.history.state as any) || {}, []);
  const initialImgData = useMemo(() => navState?.imgData || [], [navState]);

  const [photoList, setPhotoList] = useState<string[]>(initialImgData);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

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
          title: t("editPhoto", "Photo Updated"),
          description: t("editPhoto", "Your photo was replaced successfully."),
        });
        resetSelection();
      }
    },
    onError: (err) => {
      toast({
        title: t("editPhoto", "Error Updating Photo"),
        description: err.message || t("editPhoto", "Upload failed"),
        variant: "destructive",
      });
    },
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!adId) throw new Error("Ad ID is missing");

      const formData = new FormData();
      formData.append("photo", file);

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
          title: t("editPhoto", "Photo Uploaded"),
          description: t("editPhoto", "New photo added."),
        });
      }
    },
    onError: (err) => {
      toast({
        title: t("editPhoto", "Upload Failed"),
        description: err.message || t("editPhoto", "Failed to upload photo"),
        variant: "destructive",
      });
    },
  });

  const resetSelection = useCallback(() => {
    setSelectedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("editPhoto", "File too large"),
          description: t("editPhoto", "Please select images smaller than 5MB"),
          variant: "destructive",
        });
        return false;
      }
      return true;
    },
    [toast, t]
  );

  const handleReplaceClick = useCallback((url: string) => {
    setSelectedUrl(url);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const file = files[0];
      if (!file || !validateFile(file)) return;

      // If there's a selected URL, replace it; otherwise add new photo
      if (selectedUrl) {
        await updatePhotoMutation.mutateAsync(file);
      } else {
        await uploadPhotosMutation.mutateAsync(file);
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
      resetSelection();
    },
    [
      selectedUrl,
      validateFile,
      updatePhotoMutation,
      uploadPhotosMutation,
      resetSelection,
    ]
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
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleReplaceClick(url)}
                disabled={updatePhotoMutation.isPending}>
                {updatePhotoMutation.isPending && selectedUrl === url
                  ? t("editPhoto", "Uploading...")
                  : t("editPhoto", "Replace")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    ),
    [
      photoList,
      handleReplaceClick,
      t,
      updatePhotoMutation.isPending,
      selectedUrl,
    ]
  );

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("editPhoto", "Edit Photos")}
          description={t("editPhoto", "Manage or replace your ad photo")}
        />
        <main className="p-6 mt-24">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{t("editPhoto", "Your Ad Photo")}</CardTitle>
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

                <div className="mt-6 flex justify-between">
                  {photoList.length === 0 && (
                    <Button
                      onClick={handleAddNewPhoto}
                      disabled={uploadPhotosMutation.isPending}>
                      <i className="fas fa-plus mx-2"></i>
                      {uploadPhotosMutation.isPending
                        ? t("editPhoto", "Uploading...")
                        : t("editPhoto", "Add Photo")}
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
