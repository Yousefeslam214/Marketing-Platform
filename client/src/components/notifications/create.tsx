
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
    DialogTrigger,
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
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
    titleEn: z.string().min(1).max(200),
    titleAr: z.string().min(1).max(200),
    messageEn: z.string().min(1).max(500),
    messageAr: z.string().min(1).max(500),
});

export function CreateNotification() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);
            await apiRequest("POST", `${VITE_API_BASE_URL}/api/notifications/admin/broadcast`, values);

            toast({
                title: t("adminNotifications", "successSent"),
                description: t("adminNotifications", "successSent"),
            });

            form.reset();
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ["api", "notifications", "admin", "templates"] });
        } catch (error) {
            toast({
                title: t("adminNotifications", "errorSent"),
                description: t("adminNotifications", "errorSent"),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("adminNotifications", "createNotification")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("adminNotifications", "createNotification")}</DialogTitle>
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
                            {t("adminNotifications", "sendBroadcast")}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

