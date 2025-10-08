import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import PublicHeader from "@/components/layout/publicHeader";

export default function LandingPage() {
  const { language, isRTL } = useLanguage();
  localStorage.clear();

  // Simple translation object
  const content =
    language === "ar"
      ? {
          nav: {
            features: "المزايا",
            howItWorks: "كيف يعمل",
            pricing: "الأسعار",
            faq: "الأسئلة الشائعة",
            terms: "الشروط والأحكام",
            contact: "اتصل بنا",
            login: "تسجيل الدخول",
            signup: "إنشاء حساب",
          },
          hero: {
            badge: "🚀 منصة تسويق متقدمة",
            title: "نمِّ عملك بالإعلان الذكي",
            subtitle:
              "أنشئ وأدر وحسن حملاتك الإعلانية عبر منصات متعددة. احصل على تحليلات فورية وعظم عائد استثمارك مع منصتنا التسويقية الذكية.",
            getStarted: "ابدأ مجاناً",
            watchDemo: "شاهد العرض التوضيحي",
            noSetup: "لا حاجة للإعداد",
            multiPlatform: "متعدد المنصات",
            analytics: "تحليلات فورية",
          },
          features: {
            title: "كل ما تحتاجه للنجاح",
            subtitle:
              "منصتنا توفر أدوات شاملة لإنشاء وإدارة وتحسين حملاتك الإعلانية بسهولة.",
            items: [
              {
                icon: "fas fa-rocket",
                title: "إعداد سهل",
                description:
                  "ابدأ في دقائق مع واجهتنا البديهية. لا حاجة لمعرفة تقنية.",
              },
              {
                icon: "fas fa-chart-bar",
                title: "تحليلات متقدمة",
                description:
                  "تتبع الأداء برؤى مفصلة وتقارير فورية لجميع حملاتك.",
              },
              {
                icon: "fas fa-globe",
                title: "دعم متعدد المنصات",
                description:
                  "أدر الحملات عبر فيسبوك وإنستجرام وجوجل والمزيد من لوحة واحدة.",
              },
              {
                icon: "fas fa-shield-alt",
                title: "أمان على مستوى المؤسسات",
                description: "بياناتك محمية بأمان مصرفي وتخزين مشفر.",
              },
              {
                icon: "fas fa-clock",
                title: "تحديثات فورية",
                description:
                  "راقب حملاتك في الوقت الفعلي واتخذ قرارات مدروسة فوراً.",
              },
              {
                icon: "fas fa-headset",
                title: "دعم على مدار الساعة",
                description:
                  "احصل على المساعدة عند الحاجة مع فريق الدعم المخصص المتاح طوال الوقت.",
              },
            ],
          },
          howItWorks: {
            title: "كيف يعمل",
            subtitle: "اجعل حملاتك الإعلانية تعمل في أربع خطوات بسيطة فقط.",
            getStarted: "ابدأ حملتك الأولى",
            steps: [
              {
                step: "1",
                icon: "fas fa-user-plus",
                title: "التسجيل",
                description: "أنشئ حسابك المجاني واحصل على وصول فوري لمنصتنا.",
              },
              {
                step: "2",
                icon: "fas fa-cog",
                title: "إعداد الملف الشخصي",
                description: "اضبط ملف عملك واربط حساباتك الإعلانية.",
              },
              {
                step: "3",
                icon: "fas fa-bullhorn",
                title: "إنشاء الحملات",
                description:
                  "صمم وأطلق حملاتك الإعلانية بأدواتنا سهلة الاستخدام.",
              },
              {
                step: "4",
                icon: "fas fa-chart-line",
                title: "التتبع والتحسين",
                description: "راقب الأداء وحسن حملاتك للحصول على نتائج أفضل.",
              },
            ],
          },
          stats: {
            campaigns: "الحملات النشطة",
            clients: "العملاء السعداء",
            uptime: "وقت التشغيل",
            support: "الدعم",
          },
          cta: {
            title: "مستعد لتحويل تسويقك؟",
            subtitle: "انضم لآلاف الشركات التي تنمو بالفعل مع منصتنا.",
            getStarted: "ابدأ التجربة المجانية",
            contact: "تحدث مع المبيعات",
          },
          footer: {
            description: "أقوى منصة تسويق لتنمية عملك بحلول إعلانية ذكية.",
            product: "المنتج",
            support: "الدعم",
            contact: "اتصل بنا",
            privacy: "سياسة الخصوصية",
            terms: "شروط الخدمة",
          },
        }
      : {
          nav: {
            features: "Features",
            howItWorks: "How It Works",
            pricing: "Pricing",
            faq: "FAQ",
            terms: "Terms",
            contact: "Contact",
            login: "Login",
            signup: "Sign Up",
          },
          hero: {
            badge: "🚀 Advanced Marketing Platform",
            title: "Grow Your Business with Smart Advertising",
            subtitle:
              "Create, manage, and optimize your advertising campaigns across multiple platforms. Get real-time analytics and maximize your ROI with our intelligent marketing platform.",
            getStarted: "Get Started Free",
            watchDemo: "Watch Demo",
            noSetup: "No Setup Required",
            multiPlatform: "Multi-Platform",
            analytics: "Real-time Analytics",
          },
          features: {
            title: "Everything You Need to Succeed",
            subtitle:
              "Our platform provides comprehensive tools to create, manage, and optimize your advertising campaigns with ease.",
            items: [
              {
                icon: "fas fa-rocket",
                title: "Easy Setup",
                description:
                  "Get started in minutes with our intuitive interface. No technical knowledge required.",
              },
              {
                icon: "fas fa-chart-bar",
                title: "Advanced Analytics",
                description:
                  "Track performance with detailed insights and real-time reporting on all your campaigns.",
              },
              {
                icon: "fas fa-globe",
                title: "Multi-Platform Support",
                description:
                  "Manage campaigns across Facebook, Instagram, Google, and more from one dashboard.",
              },
              {
                icon: "fas fa-shield-alt",
                title: "Enterprise Security",
                description:
                  "Your data is protected with bank-level security and encrypted storage.",
              },
              {
                icon: "fas fa-clock",
                title: "Real-Time Updates",
                description:
                  "Monitor your campaigns in real-time and make data-driven decisions instantly.",
              },
              {
                icon: "fas fa-headset",
                title: "24/7 Support",
                description:
                  "Get help when you need it with our dedicated support team available around the clock.",
              },
            ],
          },
          howItWorks: {
            title: "How It Works",
            subtitle:
              "Get your advertising campaigns up and running in just four simple steps.",
            getStarted: "Start Your First Campaign",
            steps: [
              {
                step: "1",
                icon: "fas fa-user-plus",
                title: "Sign Up",
                description:
                  "Create your free account and get instant access to our platform.",
              },
              {
                step: "2",
                icon: "fas fa-cog",
                title: "Setup Profile",
                description:
                  "Configure your business profile and connect your advertising accounts.",
              },
              {
                step: "3",
                icon: "fas fa-bullhorn",
                title: "Create Campaigns",
                description:
                  "Design and launch your advertising campaigns with our easy-to-use tools.",
              },
              {
                step: "4",
                icon: "fas fa-chart-line",
                title: "Track & Optimize",
                description:
                  "Monitor performance and optimize your campaigns for better results.",
              },
            ],
          },
          stats: {
            campaigns: "Active Campaigns",
            clients: "Happy Clients",
            uptime: "Uptime",
            support: "Support",
          },
          cta: {
            title: "Ready to Transform Your Marketing?",
            subtitle:
              "Join thousands of businesses already growing with our platform.",
            getStarted: "Start Free Trial",
            contact: "Talk to Sales",
          },
          footer: {
            description:
              "The most powerful marketing platform to grow your business with intelligent advertising solutions.",
            product: "Product",
            support: "Support",
            contact: "Contact",
            privacy: "Privacy Policy",
            terms: "Terms of Service",
          },
        };

  return (
    <div
      className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}

      flex flex-col items-center justify-center  w-full
    
    `}>
      {/* Navigation */}
      <PublicHeader />

      {/* Hero Section */}
      <section
        className="relative py-20 lg:py-32 overflow-hidden
      
      ">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 ${isRTL ? "lg:order-2" : ""}`}>
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit mr-2">
                  {/* <i className="fas fa-rocket mr-2"></i> */}
                  {content.hero.badge}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  {content.hero.title}
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  {content.hero.subtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    <i className="fas fa-play-circle mr-2"></i>
                    {content.hero.getStarted}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto">
                  <i className="fas fa-video mr-2"></i>
                  {content.hero.watchDemo}
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  {content.hero.noSetup}
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  {content.hero.multiPlatform}
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  {content.hero.analytics}
                </div>
              </div>
            </div>

            <div className={`relative ${isRTL ? "lg:order-1" : ""}`}>
              <div className="relative bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 shadow-2xl">
                <div className="bg-background rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Campaign Dashboard</h3>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        2.5K
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Campaigns
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        85%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Engagement
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        12.4K
                      </div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-end justify-center p-4">
                    <div className="text-center">
                      <i className="fas fa-chart-line text-3xl text-primary mb-2"></i>
                      <div className="text-sm text-muted-foreground">
                        Performance Analytics
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              {content.features.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.items.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <i className={`${feature.icon} text-primary text-xl`}></i>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              {content.howItWorks.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {content.howItWorks.steps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <i
                      className={`${step.icon} text-primary-foreground text-xl`}></i>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/signup">
              <Button size="lg">
                <i className="fas fa-arrow-right mr-2"></i>
                {content.howItWorks.getStarted}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary w-full">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center text-primary-foreground">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">10K+</div>
              <div className="text-primary-foreground/80">
                {content.stats.campaigns}
              </div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">
                {content.stats.clients}
              </div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-primary-foreground/80">
                {content.stats.uptime}
              </div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80">
                {content.stats.support}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 w-[80%]">
        <div className="container">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {content.cta.title}
            </h2>
            <p className="text-xl mb-8 opacity-90">{content.cta.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto">
                  <i className="fas fa-rocket mr-2"></i>
                  {content.cta.getStarted}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <i className="fas fa-phone mr-2"></i>
                {content.cta.contact}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="py-12 border-t bg-muted/50
      w-full
      flex flex-col items-center justify-center
      ">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.webp" alt="Logo" className="w-[100px] h-10" />
              </div>
              <p className="text-muted-foreground">
                {content.footer.description}
              </p>

              <div
                className={`flex ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                } space-x-4 rtl:space-x-reverse mt-2`}>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-facebook"></i>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{content.footer.product}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors">
                    {content.nav.features}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-primary transition-colors">
                    {content.nav.pricing}
                  </a>
                </li>
                <li>
                  <a
                    href="/login"
                    className="hover:text-primary transition-colors">
                    {content.nav.login}
                  </a>
                </li>
                <li>
                  <a
                    href="/signup"
                    className="hover:text-primary transition-colors">
                    {content.nav.signup}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{content.footer.support}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-primary transition-colors">
                    {content.nav.contact}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-primary transition-colors">
                    {content.nav.faq}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-terms"
                    className="hover:text-primary transition-colors">
                    {content.nav.terms}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-2"></i>
                  support@docuchatai.com
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone mr-2"></i>
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  San Francisco, CA
                </li>
                <li className="mt-4">
                  <Link href="/contact">
                    <Button variant="outline" size="sm">
                      Get in Touch
                    </Button>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 DocuChatAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
