import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
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
import { useLanguage } from "@/hooks/use-language";

export default function Login() {
  const { isRTL, t } = useLanguage();
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data);
      setLocation("/dashboard");
      toast({
        title: t("auth", "loginSuccess") || "Login successful",
        description: t("auth", "welcomeBack") || "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: t("auth", "loginFailed") || "Login failed",
        description:
          error.message ||
          t("auth", "invalidCredentials") ||
          "Invalid email or password",
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
          <div className="flex items-center justify-between flex-col mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-bolt text-primary-foreground text-lg"></i>
              </div>
              <CardTitle className="text-2xl">octopusad</CardTitle>
            </div>
            {/* <LanguageToggle /> */}
          </div>
          <CardDescription>
            {t("auth", "description") ||
              "Sign in to your marketing platform account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth", "email") || "Email"}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={
                          t("auth", "emailPlaceholder") || "Enter your email"
                        }
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth", "password") || "Password"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          t("auth", "passwordPlaceholder") ||
                          "Enter your password"
                        }
                        data-testid="input-password"
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
                data-testid="button-login">
                {isLoading ? (
                  <>
                    <i
                      className={`fas fa-spinner fa-spin ${
                        isRTL ? "ml-2" : "mr-2"
                      }`}></i>
                    {t("auth", "signingIn") || "Signing in..."}
                  </>
                ) : (
                  t("auth", "signIn") || "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("auth", "noAccount") || "Don't have an account?"}{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline"
                data-testid="link-signup">
                {t("auth", "signUp") || "Sign up"}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
