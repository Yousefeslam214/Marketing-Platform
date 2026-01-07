
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const formSchema = z.object({
    titleEn: z.string().min(1).max(200),
    titleAr: z.string().min(1).max(200),
    messageEn: z.string().min(1).max(500),
    messageAr: z.string().min(1).max(500),
});

interface UpdateNotificationProps {
    notification: any; // Types should be imported from schema ideally
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateNotification({ notification, open, onOpenChange }: UpdateNotificationProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            titleEn: "",
            titleAr: "",
            messageEn: "",
            messageAr: "",
        },
    });

    useEffect(() => {
        if (notification) {
            form.reset({
                titleEn: notification.titleEn || "",
                titleAr: notification.titleAr || "",
                messageEn: notification.messageEn || "",
                messageAr: notification.messageAr || "",
            });
        }
    }, [notification, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!notification?.id) return;

        try {
            setIsLoading(true);
            // Endpoint updated per user request: PATCH /api/notifications/admin/:id
            await apiRequest("PATCH", `${VITE_API_BASE_URL}/api/notifications/admin/${notification.id}`, values);

            toast({
                title: t("adminNotifications", "successUpdated"),
                description: t("adminNotifications", "successUpdated"),
            });

            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: ["api", "notifications", "admin", "templates"] });
        } catch (error) {
            toast({
                title: t("adminNotifications", "errorUpdated"),
                description: t("adminNotifications", "errorUpdated"),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("adminNotifications", "editNotification")}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="titleEn"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("adminNotifications", "titleEn")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="titleAr"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("adminNotifications", "titleAr")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="text-right" dir="rtl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="messageEn"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("adminNotifications", "messageEn")}</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="messageAr"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("adminNotifications", "messageAr")}</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} className="text-right" dir="rtl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("adminNotifications", "updateNotification")}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
