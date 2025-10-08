import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import {
  Shield,
  ArrowLeft,
  FileText,
  Lock,
  Eye,
  Globe,
  UserCheck,
  Scale,
} from "lucide-react";

export default function PrivacyTerms() {
  const { t, isRTL } = useLanguage();

  const sections = [
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Personal Information Collection",
      content: "We collect information you provide directly to us, such as when you create an account, make purchases, or contact support. This includes your name, email address, billing information, and communications."
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "How We Use Your Data",
      content: "We use your information to provide, maintain, and improve our services, process transactions, send communications, and comply with legal obligations. We do not sell your personal information to third parties."
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Data Protection & Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information. You may also request data portability and have the right to opt-out of certain communications."
    }
  ];

  const termsSection = [
    {
      icon: <Scale className="w-5 h-5" />,
      title: "Acceptance of Terms",
      content: "By accessing and using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services."
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Description of Services",
      content: "Our platform provides digital advertising tools and analytics to help businesses create, manage, and optimize their marketing campaigns. We reserve the right to modify or discontinue services at any time."
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: "User Obligations",
      content: "You are responsible for maintaining the confidentiality of your account, ensuring your content complies with our policies, and using our services in accordance with applicable laws and these terms."
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Termination",
      content: "We may terminate or suspend your account at any time for violation of these terms. You may terminate your account at any time by contacting support. Upon termination, your right to use the service ceases immediately."
    }
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-bullhorn text-primary-foreground text-sm"></i>
                </div>
                <span className="font-bold text-xl">DocuChatAI</span>
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="container relative">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Shield className="w-4 h-4 mr-2" />
              Legal Information
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Privacy Policy & Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how we protect your data and understand the terms of using our platform. Your privacy and trust are important to us.
            </p>
            <div className="text-sm text-muted-foreground">
              Last updated: January 1, 2025
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-primary" />
                Privacy Policy
              </h2>
              <div className="grid gap-6">
                {sections.map((section, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          {section.icon}
                        </div>
                        <span>{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact for Privacy */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Privacy Contact</h3>
                <p className="text-muted-foreground mb-4">If you have questions about this Privacy Policy or our data practices, please contact our privacy team:</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium">Email: privacy@docuchatai.com</p>
                  <p className="font-medium">Address: San Francisco, CA</p>
                </div>
              </CardContent>
            </Card>

            {/* Terms of Service */}
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <Scale className="w-8 h-8 mr-3 text-primary" />
                Terms of Service
              </h2>
              <div className="grid gap-6">
                {termsSection.map((section, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          {section.icon}
                        </div>
                        <span>{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Legal Contact */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Legal Contact</h3>
                <p className="text-muted-foreground mb-4">For legal matters or questions about these terms, please contact our legal team:</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium">Email: legal@docuchatai.com</p>
                  <p className="font-medium">Address: San Francisco, CA</p>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Questions about our policies?</h3>
                <p className="text-muted-foreground mb-6">
                  Our team is here to help clarify any questions you may have about our privacy policy or terms of service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg">Contact Us</Button>
                  </Link>
                  <Link href="/faq">
                    <Button variant="outline" size="lg">
                      View FAQ
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/50">
        <div className="container">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-bullhorn text-primary-foreground text-sm"></i>
              </div>
              <span className="font-bold text-xl">DocuChatAI</span>
            </div>
            <p className="text-muted-foreground">
              The most powerful marketing platform to grow your business with intelligent advertising solutions.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/contact" className="text-muted-foreground hover:text-primary">
                Contact
              </Link>
              <Link href="/privacy-terms" className="text-muted-foreground hover:text-primary">
                Privacy & Terms
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-primary">
                FAQ
              </Link>
            </div>
            <div className="border-t pt-8 text-center text-muted-foreground">
              <p>&copy; 2025 DocuChatAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}