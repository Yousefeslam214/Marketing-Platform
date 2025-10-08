import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  ArrowLeft,
  MessageCircle,
  CreditCard,
  Shield,
  Clock,
  Target,
  Zap,
} from "lucide-react";

export default function FAQ() {
  const { t, isRTL } = useLanguage();

  const faqCategories = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "General Questions",
      items: [
        { question: "How quickly will I receive a response?", answer: "We typically respond to all inquiries within 24 hours during business days." },
        { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise accounts." },
        { question: "Do you offer refunds for unused credits?", answer: "Yes, we offer refunds for unused credits within 30 days of purchase. Contact support for assistance." },
      ]
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Billing & Pricing",
      items: [
        { question: "What are your pricing plans?", answer: "We offer flexible pricing plans starting from $29/month for small businesses up to custom enterprise solutions. All plans include our core advertising tools and analytics." },
        { question: "How do I upgrade my plan?", answer: "You can upgrade your plan at any time from your billing settings. The upgrade will be prorated based on your current billing cycle." },
        { question: "Do you offer refunds?", answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. Contact our support team for assistance." },
      ]
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Ad Management",
      items: [
        { question: "How do I create my first ad campaign?", answer: "Navigate to the Campaigns section and click 'Create New Ad'. Follow our step-by-step wizard to set up your targeting, budget, and creative content." },
        { question: "What targeting options are available?", answer: "We offer demographic targeting, interest-based targeting, location targeting, and behavioral targeting to help you reach your ideal audience." },
        { question: "How long does it take for ads to be approved?", answer: "Most ads are reviewed and approved within 24 hours. Complex campaigns may take up to 48 hours for review." },
      ]
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Account & Security",
      items: [
        { question: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page and follow the instructions sent to your email address." },
        { question: "Is my data secure?", answer: "Yes, we use enterprise-grade security measures including SSL encryption, regular security audits, and comply with GDPR and CCPA regulations." },
        { question: "Can I delete my account?", answer: "Yes, you can delete your account from the account settings. Please note this action is irreversible and all data will be permanently removed." },
      ]
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
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our platform, features, and services. Can't find what you're looking for? Contact our support team.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {faqCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {category.icon}
                      </div>
                      <span>{category.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, index) => (
                        <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Need More Help */}
            <Card className="mt-12 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                <p className="text-muted-foreground mb-6">
                  Our support team is here to help you succeed. Reach out anytime!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg">Contact Support</Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule a Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">24h</div>
              <div className="text-muted-foreground">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-muted-foreground">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-muted-foreground">Support Available</div>
            </div>
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