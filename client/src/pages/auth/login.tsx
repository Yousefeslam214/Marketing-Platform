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
import { getErrorMessage } from "@/lib/errorUtils";

export default function Login() {
  const { isRTL, t } = useLanguage();
  const [, setLocation] = useLocation();
  const { login, loginWithGoogle, isLoading } = useAuth();
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
      window.location.reload();
      toast({
        title: t("auth", "loginSuccess") || "Login successful",
        description: t("auth", "welcomeBack") || "Welcome back!",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      toast({
        title: t("auth", "loginFailed") || "Login failed",
        description:
          message || t("auth", "invalidCredentials") || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      const message = getErrorMessage(error);
      toast({
        title: t("auth", "loginFailed") || "Login failed",
        description: message || "Google authentication failed",
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
              <img
                src="../../../public/logo.webp"
                alt="Logo"
                className="h-11"
              />
              {/* <CardTitle className="text-2xl">
              </CardTitle> */}
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

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              data-testid="button-google-login">
              <i className={`fab fa-google ${isRTL ? "ml-2" : "mr-2"}`}></i>
              Continue with Google
            </Button>
          </div>

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
