import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupData } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TokenManager } from "@/lib/auth";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup, isLoading, user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  // Redirect if already authenticated
  if (TokenManager.getAccessToken()) {
    setLocation("/dashboard");
    return null;
  }

  const onSubmit = async (data: SignupData) => {
    try {
      await signup(data);
      setLocation("/dashboard");
      window.location.reload();
      toast({
        title: t("auth", "accountCreated"),
        description: t("auth", "accountCreatedSuccess"),
      });
    } catch (error: any) {
      toast({
        title: t("auth", "signupFailed"),
        description: error.message || t("auth", "signupFailedMessage"),
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-background px-4 ${
        isRTL ? "rtl" : "ltr"
      }`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-bolt text-primary-foreground text-lg"></i>
            </div>
            <CardTitle className="text-2xl">octopusad</CardTitle>
          </div>
          <CardDescription>{t("auth", "signupDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth", "email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("auth", "emailPlaceholder")}
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth", "username")}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t("auth", "usernamePlaceholder")}
                        data-testid="input-username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth", "password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("auth", "passwordPlaceholder2")}
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth", "confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("auth", "confirmPasswordPlaceholder")}
                        data-testid="input-confirm-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-signup">
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {t("auth", "creatingAccount")}
                  </>
                ) : (
                  t("auth", "createAccount")
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("auth", "alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="text-primary hover:underline"
                data-testid="link-login">
                {t("auth", "signIn2")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
