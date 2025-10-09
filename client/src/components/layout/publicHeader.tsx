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

const PublicHeader = () => {
  const { language, isRTL } = useLanguage();
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
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
      flex flex-col items-center justify-center
      ">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center space-x-2"
            onClick={() => (location.href = "/")}>
            <img src="/logo.webp" alt="Logo" className="w-[100px] h-10" />
          </button>
        </div>

        <div
          className={` hidden md:flex items-center space-x-6
            direction: ${isRTL ? "rtl" : "ltr"}`}>
          <a
            href="/#features"
            className="text-sm font-medium hover:text-primary transition-colors
                
                ">
            {content.nav.features}
          </a>
          <a
            href="/#how-it-works"
            className="text-sm font-medium hover:text-primary transition-colors">
            {content.nav.howItWorks}
          </a>
          <a
            href="/#pricing"
            className="text-sm font-medium hover:text-primary transition-colors">
            {content.nav.pricing}
          </a>
          <Link href="/faq">
            <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              {content.nav.faq}
            </span>
          </Link>
          <Link href="/privacy-terms">
            <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              {content.nav.terms}
            </span>
          </Link>
          <Link href="/contact">
            <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              {content.nav.contact}
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <LanguageToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {content.nav.login}
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">{content.nav.signup}</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicHeader;
