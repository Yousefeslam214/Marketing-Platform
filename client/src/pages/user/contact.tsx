import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: t("contact", "successTitle"),
        description: t("contact", "successMessage"),
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: t("contact", "errorTitle"),
        description: t("contact", "errorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("contact", "title")}
          description={t("contact", "subtitle")}
        />

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {t("contact", "infoTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          {t("contact", "email")}
                        </h3>
                        <p className="text-muted-foreground">
                          support@docuchatai.com
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          {t("contact", "phone")}
                        </h3>
                        <p className="text-muted-foreground">
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          {t("contact", "address")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("contact", "addressValue")}
                        </p>
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          {t("contact", "hours")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("contact", "hoursValue")}
                        </p>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="pt-4 border-t">
                      <h3 className="font-medium text-foreground mb-3">
                        {t("contact", "followUs")}
                      </h3>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9">
                          <Facebook className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9">
                          <Twitter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9">
                          <Instagram className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9">
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("contact", "formTitle")}</CardTitle>
                  <p className="text-muted-foreground">
                    {t("contact", "formDescription")}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">{t("contact", "name")}</Label>
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
                      <div>
                        <Label htmlFor="email">
                          {t("contact", "formEmail")}
                        </Label>
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

                    {/* Subject */}
                    <div>
                      <Label htmlFor="subject">{t("contact", "subject")}</Label>
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

                    {/* Message */}
                    <div>
                      <Label htmlFor="message">{t("contact", "message")}</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        placeholder={t("contact", "messagePlaceholder")}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          {t("contact", "sending")}
                        </>
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

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t("contact", "faqTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">
                    {t("contact", "question1")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("contact", "answer1")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">
                    {t("contact", "question2")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("contact", "answer2")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">
                    {t("contact", "question3")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("contact", "answer3")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">
                    {t("contact", "question4")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("contact", "answer4")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
