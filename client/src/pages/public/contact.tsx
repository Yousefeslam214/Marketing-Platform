import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,

} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: t("contact", "successTitle"),
        description: t("contact", "successMessage"),
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: t("contact", "errorTitle"),
        description:
          (error instanceof Error ? error.message : "") ||
         t("contact", "errorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}
      flex flex-col items-center
      `}
      dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="container relative">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Mail className="w-4 h-4 mr-2" />
              {t("contact", "getInTouch")}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              {t("contact", "title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("contact", "subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {t("contact", "infoTitle")}
                </h2>
                <div className="grid gap-6">
                  {/* Email */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center space-x-4 ${
                          isRTL ? "space-x-reverse" : ""
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {t("contact", "email")}
                          </h3>
                          <p className="text-muted-foreground">
                            info@octopusad.com
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phone */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center space-x-4 ${
                          isRTL ? "space-x-reverse" : ""
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {t("contact", "phone")}
                          </h3>
                          <p className="text-muted-foreground">0502274696</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center space-x-4 ${
                          isRTL ? "space-x-reverse" : ""
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {t("contact", "address")}
                          </h3>
                          <p className="text-muted-foreground">
                            {t("contact", "addressValue")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Working Hours */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center space-x-4 ${
                          isRTL ? "space-x-reverse" : ""
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {t("contact", "hours")}
                          </h3>
                          <p className="text-muted-foreground">
                            {t("contact", "hoursValue")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <div className="mt-8
                flex flex-col 

                ">
                  <h3 className="
                  text-xl font-bold mb-6
                   mb-4">
                    {t("contact", "followUs")}
                  </h3>
                  <div
                    className={`flex space-x-4 ${
                      isRTL ? "space-x-reverse" : ""
                    }`}>
                    <a
                      href="#"
                      className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {t("contact", "formTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("contact", "name")} *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder={t("contact", "namePlaceholder")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("contact", "email")} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder={t("contact", "emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        {t("contact", "subject")} *
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        placeholder={t("contact", "subjectPlaceholder")}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {t("contact", "message")} *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        placeholder={t("contact", "messagePlaceholder")}
                        rows={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full">
                      {isSubmitting ? (
                        <>{t("contact", "sending")}...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {t("contact", "submit")}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
