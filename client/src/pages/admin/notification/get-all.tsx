import { useLanguage } from "@/hooks/use-language";
import { useApiQuery } from "@/hooks/useApiQuery";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { CreateNotification } from "@/components/notifications/create";
import { UpdateNotification } from "@/components/notifications/update";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminNotifications() {
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const [editingNotification, setEditingNotification] = useState<any>(null);

    const { data: notificationsData, isLoading } = useApiQuery<any[]>({
        key: ["api", "notifications", "admin", "templates"],
        url: `${VITE_API_BASE_URL}/api/notifications/admin/templates`,
    });

    const notifications = notificationsData?.data || [];

    const handleDelete = async (id: string) => {
        if (!confirm(t("adminNotifications", "deleteConfirm"))) return;

        try {
            await apiRequest("DELETE", `${VITE_API_BASE_URL}/api/notifications/admin/${id}`);
            toast({
                title: t("adminNotifications", "successDeleted"),
                description: t("adminNotifications", "successDeleted"),
            });
            queryClient.invalidateQueries({ queryKey: ["api", "notifications", "admin", "templates"] });
        } catch (error) {
            toast({
                title: t("adminNotifications", "errorDeleted"),
                description: t("adminNotifications", "errorDeleted"),
                variant: "destructive",
            });
        }
    };

    const isRtl = language === "ar";

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t("adminNotifications", "title")}</h1>
                <CreateNotification />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("adminNotifications", "broadcastHistory")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">{t("adminNotifications", "loading")}</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>
                                        {t("adminNotifications", "title")}
                                    </TableHead>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>
                                        {t("adminNotifications", "messageEn")}
                                    </TableHead>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>
                                        {t("adminNotifications", "date")}
                                    </TableHead>
                                    <TableHead className="text-center">{t("adminNotifications", "actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            {t("adminNotifications", "noNotifications")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    notifications?.map((notification: any) => (
                                        <TableRow key={notification.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{notification.titleEn}</span>
                                                    <span className="text-muted-foreground text-sm">
                                                        {notification.titleAr}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <div className="flex flex-col truncate">
                                                    <span className="truncate" title={notification.messageEn}>
                                                        {notification.messageEn}
                                                    </span>
                                                    <span
                                                        className="text-muted-foreground text-sm truncate"
                                                        title={notification.messageAr}
                                                    >
                                                        {notification.messageAr}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {notification.createdAt &&
                                                    format(new Date(notification.createdAt), "PPP")}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingNotification(notification)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(notification.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <UpdateNotification
                notification={editingNotification}
                open={!!editingNotification}
                onOpenChange={(open) => !open && setEditingNotification(null)}
            />
        </div>
    );
}
