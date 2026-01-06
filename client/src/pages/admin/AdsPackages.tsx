import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";

type AdsPackage = {
  id: string;
  name: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
};

const API_URL = `${VITE_API_BASE_URL}/api/ads-packages`;

export default function AdsPackages() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useApiQuery<AdsPackage[]>({
    key: ["ads-packages"],
    url: API_URL,
  });

  const packages = useMemo(() => data?.data ?? [], [data]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setAmount("");
  };

  const baseHeaders = () => {
    const token = TokenManager.getAccessToken();
    if (!token) throw new Error("Unauthorized");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; amount: number }) => {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to create package");
      }
      return json;
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم إنشاء الباقة" : "Package created",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["ads-packages"] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل إنشاء الباقة" : "Failed to create package",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string; amount: number }) => {
      const res = await fetch(`${API_URL}/${payload.id}`, {
        method: "PUT",
        headers: baseHeaders(),
        body: JSON.stringify({ name: payload.name, amount: payload.amount }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to update package");
      }
      return json;
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم تحديث الباقة" : "Package updated",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["ads-packages"] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل تحديث الباقة" : "Failed to update package",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: baseHeaders(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || "Failed to delete package");
      }
      return json;
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم حذف الباقة" : "Package deleted",
      });
      if (editingId) resetForm();
      queryClient.invalidateQueries({ queryKey: ["ads-packages"] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل حذف الباقة" : "Failed to delete package",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!name.trim() || !amount) {
      toast({
        title: isRTL ? "أدخل الاسم والمبلغ" : "Provide name and amount",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: isRTL ? "المبلغ غير صالح" : "Invalid amount",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: name.trim(),
        amount: numericAmount,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        amount: numericAmount,
      });
    }
  };

  const confirmDelete = (id: string) => {
    const confirmed = window.confirm(
      isRTL
        ? "هل أنت متأكد من حذف هذه الباقة؟"
        : "Delete this package?"
    );
    if (confirmed) deleteMutation.mutate(id);
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("adsPackages", "title")}
          description={t("adsPackages", "description")}
        />

        <main className="p-4 sm:p-6 space-y-6 mt-24">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId
                  ? t("adsPackages", "editHeading")
                  : t("adsPackages", "createHeading")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t("adsPackages", "name")}
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("adsPackages", "namePlaceholder")}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t("adsPackages", "amount")}
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t("adsPackages", "amountPlaceholder")}
                    min="1"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </div>
              <div
                className={`flex gap-3 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {editingId
                    ? t("adsPackages", "updateButton")
                    : t("adsPackages", "createButton")}
                </Button>
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}>
                    {t("adsPackages", "cancelEdit")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("adsPackages", "listHeading")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("adsPackages", "empty")}
                </p>
              ) : (
                <Table dir={isRTL ? "rtl" : "ltr"}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("adsPackages", "name")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("adsPackages", "amount")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("adsPackages", "createdAt")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("adsPackages", "updatedAt")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("adsPackages", "actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className={isRTL ? "text-right" : "text-left"}>
                          {pkg.name}
                        </TableCell>
                        <TableCell className={isRTL ? "text-right" : "text-left"}>
                          {Number(pkg.amount || 0).toLocaleString()}{" "}
                          {isRTL ? "ر.س" : "SAR"}
                        </TableCell>
                        <TableCell className={isRTL ? "text-right" : "text-left"}>
                          {pkg.createdAt
                            ? new Date(pkg.createdAt).toLocaleString()
                            : "--"}
                        </TableCell>
                        <TableCell className={isRTL ? "text-right" : "text-left"}>
                          {pkg.updatedAt
                            ? new Date(pkg.updatedAt).toLocaleString()
                            : "--"}
                        </TableCell>
                        <TableCell
                          className={`flex gap-2 ${
                            isRTL ? "justify-end" : "justify-start"
                          }`}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(pkg.id);
                              setName(pkg.name);
                              setAmount(String(pkg.amount ?? ""));
                            }}
                            disabled={isSubmitting}>
                            {t("adsPackages", "edit")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => confirmDelete(pkg.id)}
                            disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending
                              ? t("adsPackages", "deleting")
                              : t("adsPackages", "delete")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
