import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import Loading from "@/components/Loading";

export interface Pixel {
  id: string;
  name?: string;
  pixelId: string;
  platform: string;
  createdAt?: string;
  updatedAt?: string;
}

const PLATFORMS = ["facebook", "tiktok", "google_ads", "snapchat"];

export default function AdminPixels() {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Pixel | null>(null);
  const [name, setName] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);

  const fetchPixels = async (): Promise<Pixel[]> => {
    const token = TokenManager.getAccessToken();
    const res = await fetch(`${VITE_API_BASE_URL}/api/pixels`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch pixels");
    const json = await res.json();
    return json.data || [];
  };

  const { data: pixels = [], isLoading } = useQuery({
    queryKey: ["admin", "pixels"],
    queryFn: fetchPixels,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      pixelId: string;
      platform: string;
    }) => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/pixels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create pixel");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "pixels"] });
      toast({ title: t("pixels", "createdSuccess"), description: "" });
    },
    onError: (err: any) => {
      toast({
        title: t("pixels", "createFailed"),
        description: err?.message || String(err),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { name: string; pixelId: string; platform: string };
    }) => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/pixels/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update pixel");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "pixels"] });
      toast({ title: t("pixels", "updatedSuccess"), description: "" });
    },
    onError: (err: any) => {
      toast({
        title: t("pixels", "updateFailed"),
        description: err?.message || String(err),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/pixels/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete pixel");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "pixels"] });
      toast({ title: t("pixels", "deletedSuccess"), description: "" });
    },
    onError: (err: any) => {
      toast({
        title: t("pixels", "deleteFailed"),
        description: err?.message || String(err),
        variant: "destructive",
      });
    },
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setPixelId("");
    setPlatform(PLATFORMS[0]);
    setIsOpen(true);
  }

  function openEdit(px: Pixel) {
    setEditing(px);
    setName(px.name ?? "");
    setPixelId(px.pixelId);
    setPlatform(px.platform || PLATFORMS[0]);
    setIsOpen(true);
  }

  async function onSave() {
    if (!name || !pixelId || !platform) {
      toast({
        title: t("pixels", "validationRequired"),
        variant: "destructive",
      });
      return;
    }

    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        payload: { name, pixelId, platform },
      });
    } else {
      await createMutation.mutateAsync({ name, pixelId, platform });
    }
    setIsOpen(false);
  }

  return (
    <div className="">
      <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex-1 overflow-auto max-h-[100vh]">
          <Header
            title={t("pixels", "title")}
            description={t("pixels", "description")}
            actions={
              <div className="flex items-center gap-2">
                <Button onClick={openCreate}>{t("pixels", "create")}</Button>
              </div>
            }
          />
          <main className="p-6 mt-24">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <Loading />
              ) : (
                pixels.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="flex items-center justify-between pt-6">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {p.platform} • {p.pixelId}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => openEdit(p)}>
                          {t("pixels", "edit")}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(p.id)}>
                          {t("pixels", "delete")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editing ? t("pixels", "edit") : t("pixels", "create")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("pixels", "dialogDesc")}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 py-4">
                  <Label>{t("pixels", "name")}</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <Label>{t("pixels", "pixelId")}</Label>
                  <Input
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                  />

                  <Label>{t("pixels", "platform")}</Label>
                  <Select
                    onValueChange={(v) => setPlatform(v)}
                    value={platform}>
                    <SelectTrigger>
                      <SelectValue>{platform}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((pl) => (
                        <SelectItem key={pl} value={pl}>
                          {pl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setIsOpen(false)}>
                      {t("pixels", "cancel")}
                    </Button>
                    <Button onClick={onSave}>{t("pixels", "save")}</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </div>
  );
}
