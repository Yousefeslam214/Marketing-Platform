import { useState, useRef, ChangeEvent, useEffect } from "react";
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

export default function EditPhoto() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor state for replace flow
  const editorRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPreview, setEditingPreview] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingPreviewIsBlob, setEditingPreviewIsBlob] =
    useState<boolean>(false);
  const [editingIsAdd, setEditingIsAdd] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);

  const navState = (window.history.state as any) || {};

  const imgData = navState?.imgData || [];
  console.log("edit-photo.tsx imgData:", imgData);
  const [photoList, setPhotoList] = useState<string[]>(imgData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const adId = window.location.pathname.split("/")[2];
  //   const adId = navState?.adId || window.location.pathname.split("/")[2];
  // === upload or replace ===
  const updatePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedUrl) throw new Error("No photo selected for replacement");
      const formData = new FormData();
      formData.append("photo", file);

      const url = `${VITE_API_BASE_URL}/api/advertising/updatePhoto/${adId}?photoUrl=${encodeURIComponent(
        selectedUrl
      )}`;

      // server examples show POST form-data for update; use POST to be compatible
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
      // normalize response to find the new url
      let photos: string[] = [];
      if (data?.data?.imageUrl) {
        photos = Array.isArray(data.data.imageUrl)
          ? data.data.imageUrl
          : [data.data.imageUrl];
      } else if (data?.data?.photos) {
        photos = Array.isArray(data.data.photos)
          ? data.data.photos.map((p: any) => (p?.url ? p.url : p))
          : [data.data.photos];
      } else if (data?.data?.photo) {
        photos = Array.isArray(data.data.photo)
          ? data.data.photo
          : [data.data.photo];
      }
      const newUrl = photos[0];
      if (newUrl && selectedUrl) {
        setPhotoList((prev) =>
          prev.map((p) => (p === selectedUrl ? newUrl : p))
        );
        toast({
          title: "Photo Updated",
          description: "Your photo was replaced successfully.",
        });
        setSelectedUrl(null);
        setSelectedFile(null);
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

  // === delete photo ===
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
      toast({ title: "Photo Deleted", description: "Photo removed." });
    },
    onError: (err) => {
      toast({
        title: "Error Deleting Photo",
        description: err.message || "Could not delete photo",
        variant: "destructive",
      });
    },
  });

  // === upload multiple new photos (create) ===
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
      // parse returned photos (data.data.imageUrl | data.data.photos | data.data.photo)
      let photos: string[] = [];
      if (data?.data?.imageUrl) {
        photos = Array.isArray(data.data.imageUrl)
          ? data.data.imageUrl
          : [data.data.imageUrl];
      } else if (data?.data?.photos) {
        photos = Array.isArray(data.data.photos)
          ? data.data.photos.map((p: any) => (p?.url ? p.url : p))
          : [data.data.photos];
      } else if (data?.data?.photo) {
        photos = Array.isArray(data.data.photo)
          ? data.data.photo
          : [data.data.photo];
      }
      if (photos.length) {
        setPhotoList((prev) => [...prev, ...photos]);
        toast({ title: "Photos Uploaded", description: "New photos added." });
      }
    },
    onError: (err) => {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload photos",
        variant: "destructive",
      });
    },
  });

  const handleReplaceClick = (url: string) => {
    setSelectedUrl(url);
    setEditingIsAdd(false);
    fileInputRef.current?.click();
  };

  const handleEditClick = (url: string) => {
    // Open editor with the existing server image
    setSelectedUrl(url);
    setEditingPreview(url);
    setEditingFile(null);
    setEditingPreviewIsBlob(false);
    setEditingIsAdd(false);
    setScale(1);
    setRotate(0);
    setIsEditing(true);
  };

  // default editor preview should be the first photo when not actively editing
  useEffect(() => {
    if (!isEditing && photoList && photoList.length > 0) {
      setSelectedUrl(photoList[0]);
      setEditingPreview(photoList[0]);
      setEditingPreviewIsBlob(false);
    }
  }, [isEditing, photoList]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // If selectedUrl is set, we're in a replace flow: open the editor with the first selected file
    if (selectedUrl) {
      const file = files[0];
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setEditingPreview(preview);
      setEditingFile(file);
      setEditingPreviewIsBlob(true);
      setIsEditing(true);
      // keep selectedUrl so applyEditAndReplace knows which server photo to replace
      return;
    }

    // Otherwise this is an add/new-photos flow.
    // If user selected exactly one file, open editor for edit-before-upload.
    if (files.length === 1) {
      const file = files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select images smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      const preview = URL.createObjectURL(file);
      setEditingPreview(preview);
      setEditingFile(file);
      setEditingPreviewIsBlob(true);
      setEditingIsAdd(true);
      setIsEditing(true);
      return;
    }

    // If multiple selected, treat as bulk upload (no edit)
    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select images smaller than 5MB",
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length === 0) return;
    uploadPhotosMutation.mutate(validFiles);
  };

  const applyEditAndReplace = async () => {
    // allow saving when editing an added photo (editingIsAdd) even if selectedUrl is null
    if (!editorRef.current || (!selectedUrl && !editingIsAdd)) return;
    const canvas = editorRef.current.getImageScaledToCanvas();
    try {
      await new Promise<void>((resolve, reject) => {
        try {
          canvas.toBlob(async (blob: Blob | null) => {
            if (!blob) return reject(new Error("toBlob returned null"));
            const nameFrom =
              editingFile?.name ||
              (selectedUrl ? selectedUrl.split("/").pop() : undefined) ||
              "edited.png";
            const file = new File([blob], nameFrom, {
              type: blob.type,
            });
            // call mutation: replace if selectedUrl present, otherwise upload as a new photo
            try {
              if (editingIsAdd) {
                // upload the edited new photo
                if ((uploadPhotosMutation as any).mutateAsync) {
                  const res = await (uploadPhotosMutation as any).mutateAsync([
                    file,
                  ]);
                  // normalize returned photos
                  let photos: string[] = [];
                  if (res?.data?.imageUrl) {
                    photos = Array.isArray(res.data.imageUrl)
                      ? res.data.imageUrl
                      : [res.data.imageUrl];
                  } else if (res?.data?.photos) {
                    photos = Array.isArray(res.data.photos)
                      ? res.data.photos.map((p: any) => (p?.url ? p.url : p))
                      : [res.data.photos];
                  } else if (res?.data?.photo) {
                    photos = Array.isArray(res.data.photo)
                      ? res.data.photo
                      : [res.data.photo];
                  }
                  if (photos.length) {
                    // prepend new photo(s)
                    setPhotoList((prev) => [...photos, ...prev]);
                    toast({
                      title: "Photo Added",
                      description: "New photo uploaded successfully.",
                    });
                  }
                } else {
                  // fallback: fire-and-forget
                  uploadPhotosMutation.mutate([file]);
                }
              } else {
                // replace existing photo
                if ((updatePhotoMutation as any).mutateAsync) {
                  await (updatePhotoMutation as any).mutateAsync(file);
                } else {
                  updatePhotoMutation.mutate(file);
                }
              }
              resolve();
            } catch (mErr) {
              reject(mErr);
            }
          }, "image/png");
        } catch (err) {
          reject(err);
        }
      });
    } catch (err: any) {
      // likely a SecurityError due to tainted canvas (cross-origin image without CORS)
      console.error("toBlob failed:", err);
      if (!editingPreviewIsBlob && editingPreview) {
        // try to fetch the image as a blob and reopen editor with a local blob URL
        try {
          const resp = await fetch(editingPreview);
          if (!resp.ok)
            throw new Error(`Failed to fetch image: ${resp.status}`);
          const blob = await resp.blob();
          const blobUrl = URL.createObjectURL(blob);
          setEditingPreview(blobUrl);
          setEditingPreviewIsBlob(true);
          toast({
            title: "Retry Edit",
            description:
              "Could not export edited image due to CORS. Loaded a local copy — please Save again.",
          });
          return;
        } catch (fetchErr) {
          console.error("fetch fallback failed:", fetchErr);
          toast({
            title: "Edit Failed",
            description:
              "Cannot export edited image because the server does not allow cross-origin access. Try replacing the photo with a local file instead.",
            variant: "destructive",
          });
          // close editor
          setIsEditing(false);
          setEditingPreview(null);
          setSelectedUrl(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      }
      // other errors
      toast({
        title: "Edit Failed",
        description: err?.message || "Unable to export edited image.",
        variant: "destructive",
      });
      return;
    }
    // clean up editor state only if we created a blob preview
    if (editingPreview && editingPreviewIsBlob) {
      try {
        URL.revokeObjectURL(editingPreview);
      } catch (e) {}
    }
    setEditingPreview(null);
    setEditingFile(null);
    setEditingPreviewIsBlob(false);
    setEditingIsAdd(false);
    setIsEditing(false);
    // clear file input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelEdit = () => {
    if (editingPreview && editingPreviewIsBlob) {
      try {
        URL.revokeObjectURL(editingPreview);
      } catch (e) {}
    }
    setEditingPreview(null);
    setEditingFile(null);
    setIsEditing(false);
    setEditingIsAdd(false);
    setSelectedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (editingPreview && editingPreviewIsBlob) {
        try {
          URL.revokeObjectURL(editingPreview);
        } catch (e) {}
      }
    };
  }, [editingPreview]);

  const handleDelete = (url: string) => {
    deletePhotoMutation.mutate(url);
  };

  const handleAddNewPhoto = () => {
    setSelectedUrl(null);
    fileInputRef.current?.click();
  };

  const handleAddPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    const url = `${VITE_API_BASE_URL}/api/advertising/updatePhoto/${adId}?photoUrl=`;

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${TokenManager.getAccessToken()}` },
      body: formData,
    });

    const result = await res.json();
    const newUrl = result?.data?.photos?.[0]?.url;
    if (newUrl) {
      setPhotoList((prev) => [...prev, newUrl]);
      toast({
        title: "Photo Added",
        description: "New photo uploaded successfully.",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <Header
          title={t("editPhoto", "Edit Photos")}
          description={t(
            "editPhoto",
            "Manage, replace, or delete your ad photos"
          )}
        />
        <main className="p-6">
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
                  // allow multiple when adding new photos (not replacing)
                  multiple
                />

                {photoList.length === 0 ? (
                  <p className="text-muted-foreground">
                    No photos uploaded yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photoList.map((url, i) => (
                      <div
                        key={i}
                        className="relative rounded border overflow-hidden group">
                        <img
                          src={url}
                          alt={`photo-${i}`}
                          className="w-full h-36 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-2   transition">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditClick(url)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleReplaceClick(url)}>
                            Replace
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(url)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">
                    {t("editPhoto", "Edit Photo")}
                  </h4>
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div>
                      <AvatarEditor
                        ref={editorRef}
                        image={editingPreview}
                        width={320}
                        height={200}
                        border={40}
                        scale={scale}
                        rotate={rotate}
                        // request CORS for remote images so canvas export is allowed when possible
                        crossOrigin={
                          editingPreviewIsBlob ? undefined : "anonymous"
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm mb-2">
                        {t("uploadPhoto", "Zoom")}
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
                        {t("uploadPhoto", "Rotate")}
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
                        <Button onClick={applyEditAndReplace}>
                          {t("uploadPhoto", "Save")}
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          {t("uploadPhoto", "Cancel")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button onClick={handleAddNewPhoto}>
                    <i className="fas fa-plus mr-2"></i> Add Photo
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/campaigns/${adId}`)}>
                    Done
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
