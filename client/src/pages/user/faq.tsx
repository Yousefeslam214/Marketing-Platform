import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQ() {
  const { language, isRTL } = useLanguage();

  // Define the FAQ questions with their keys
  const faqQuestions = [
    { key: "introduction", question: "", answer: "" },
    { key: "serviceUsage", question: "", answer: "" },
    { key: "contentRights", question: "", answer: "" },
    { key: "privacy", question: "", answer: "" },
    { key: "payment", question: "", answer: "" },
    { key: "userRights", question: "", answer: "" },
    { key: "security", question: "", answer: "" },
    { key: "updates", question: "", answer: "" },
    { key: "law", question: "", answer: "" },
    { key: "services", question: "", answer: "" },
    { key: "bannerSize", question: "", answer: "" },
    { key: "designProgram", question: "", answer: "" },
  ];

  // Get translations for each question
  const translatedFAQs = faqQuestions.map((faq) => {
    let question = "";
    let answer = "";

    if (language === "ar") {
      const arFaq = {
        introduction: {
          question: "مقدمة",
          answer:
            "تقدم إعلان اخطبوط شبكة من خدمات التسويق الحديث لتحسين وصول إعلاناتك على شبكات الانترنت وشراء نقرات، فإنك توافق على شروط الخدمة المحددة أدناه.",
        },
        serviceUsage: {
          question: "1. استخدام الخدمة",
          answer:
            "يجب عليك تقديم معلومات صحيحة و صادقة وغير مضللة عند انشاء اعلانك باستخدام منصة إعلان اخطبوط. لدينا الحق في تعديل، إيقاف، أو رفض نشر إعلانات قد تكون مخالفة للقوانين أو شروط الخدمة هذه.",
        },
        contentRights: {
          question: "2. المحتوى وحقوق الملكية",
          answer:
            "أنت المسؤول عن كل المحتوى الذي تنشره عبر منصتنا. يشمل هذا صور البنارات، النصوص، الروابط، وأي مواد أخرى. بعرض هذه المحتويات عبر منصة إعلن اخطبوط، فأنت تمنحنا ترخيصًا لاستخدام هذا المحتوى ضمن نطاق تقديم خدماتنا لك وللمستخدمين.",
        },
        privacy: {
          question: "3. الخصوصية",
          answer:
            "نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. يخضع استخدامك لمنصتنا لسياسة الخصوصية التي تحدد بالتفصيل كيفية جمعنا واستخدامنا وحماية معلوماتك. يرجى قراءة سياسة الخصوصية بعناية قبل استخدام المنصة.",
        },
        payment: {
          question: "4. الدفع",
          answer:
            "خدمات منصة إعلن اخطبوط تعتمد على نظام شراء مشاهدات. يتحمل العميل مسؤولية شراء الخدمة. لا يمكن استرداد المبالغ المدفوعة إلا وفقًا للشروط الواردة في اتفاقية الخدمة.",
        },
        userRights: {
          question: "5. حقوق المستخدم",
          answer:
            "يحظى المستخدمون بالحق الكامل في التحكم بمعلوماتهم الشخصية. يمكنهم عرضها وتعديلها وحذفها متى شاءوا. كما يمكنهم اختيار عدم تلقي أي اتصالات تسويقية.",
        },
        security: {
          question: "6. الأمان",
          answer:
            "نحن نستخدم أحدث التقنيات وأكثرها أمانًا لحماية بياناتك. لدينا جدار ناري قوي ونظام تشفير متطور لحماية معلوماتك من أي تهديدات محتملة.",
        },
        updates: {
          question: "7. التحديثات",
          answer:
            "نحن نعمل باستمرار على تحسين خدماتنا. قد تتطلب هذه التحسينات إجراء تعديلات على هذه الشروط. سنقوم بإبلاغك بأي تغييرات جوهرية.",
        },
        law: {
          question: "8. القانون",
          answer:
            "تحكم القوانين المحلية المعمول بها في المملكة العربية السعودية في هذه الشروط وأي نزاع قد ينشأ عنها.",
        },
        services: {
          question: "9. الخدمات",
          answer:
            "يمكنك عرض بنرات متجرك الإلكتروني أو خدماتك أمام جمهور واسع وزيادة مبيعاتك بشكل كبير. نحن نوفر لك منصة سهلة الاستخدام وفعالة لتسويق منتجاتك وخدماتك، مع خدمة تصميم صور احترافية وإنشاء روابط مصغرة لتوجيه الجمهور بسهولة.",
        },
        bannerSize: {
          question: "10. مقاس البنر",
          answer:
            "يشترط أن يكون مقاس البنر 428x1108 لعرضه على المنصة بشكل سهل للقراءة من قبل الجمهور.",
        },
        designProgram: {
          question: "11. برنامج للتصميم",
          answer:
            "يمكنك استخدام كانفا لتصميم صور البنرات بشكل احترافي حتى يمكنك رفعها عبر منصة إعلن اخطبوط. كانفا أداة تصميم رائعة وسهلة الاستخدام، مثالية لإنشاء بنرات إعلانية جذابة لمنصتك.",
        },
      };
      question = arFaq[faq.key as keyof typeof arFaq]?.question || "";
      answer = arFaq[faq.key as keyof typeof arFaq]?.answer || "";
    } else {
      const enFaq = {
        introduction: {
          question: "Introduction",
          answer:
            "OctopusAd offers a modern marketing services network to improve the reach of your ads on the internet and purchase clicks. By using our service, you agree to the terms of service specified below.",
        },
        serviceUsage: {
          question: "1. Service Usage",
          answer:
            "You must provide accurate, truthful, and non-misleading information when creating your ads using the OctopusAd platform. We have the right to modify, suspend, or refuse to `publi`sh ads that may violate laws or these terms of service.",
        },
        contentRights: {
          question: "2. Content and Property Rights",
          answer:
            "You are responsible for all content you publish through our platform. This includes banner images, texts, links, and any other materials. By displaying this content through the OctopusAd platform, you grant us a license to use this content within the scope of providing our services to you and users.",
        },
        privacy: {
          question: "3. Privacy",
          answer:
            "We are committed to protecting your privacy and personal data. Your use of our platform is subject to our privacy policy that details how we collect, use, and protect your information. Please read the privacy policy carefully before using the platform.",
        },
        payment: {
          question: "4. Payment",
          answer:
            "OctopusAd platform services are based on a view purchase system. The customer is responsible for purchasing the service. Paid amounts cannot be refunded except according to the terms stated in the service agreement.",
        },
        userRights: {
          question: "5. User Rights",
          answer:
            "Users have the full right to control their personal information. They can view, modify, and delete it whenever they want. They can also choose not to receive any marketing communications.",
        },
        security: {
          question: "6. Security",
          answer:
            "We use the latest and most secure technologies to protect your data. We have a strong firewall and advanced encryption system to protect your information from any potential threats.",
        },
        updates: {
          question: "7. Updates",
          answer:
            "We are constantly working to improve our services. These improvements may require modifications to these terms. We will notify you of any material changes.",
        },
        law: {
          question: "8. Law",
          answer:
            "The applicable local laws in Saudi Arabia govern these terms and any dispute that may arise from them.",
        },
        services: {
          question: "9. Services",
          answer:
            "You can display banners of your online store or services to a wide audience and significantly increase your sales. We provide you with an easy-to-use and effective platform to market your products and services, with professional image design service and short link creation to direct the audience easily.",
        },
        bannerSize: {
          question: "10. Banner Size",
          answer:
            "The banner size must be 428x1108 to display it on the platform in a way that is easy to read by the audience.",
        },
        designProgram: {
          question: "11. Design Program",
          answer:
            "You can use Canva to design banner images professionally so you can upload them through the OctopusAd platform. Canva is a wonderful and easy-to-use design tool, perfect for creating attractive advertising banners for your platform.",
        },
      };
      question = enFaq[faq.key as keyof typeof enFaq]?.question || "";
      answer = enFaq[faq.key as keyof typeof enFaq]?.answer || "";
    }

    return { question, answer };
  });

  const title =
    language === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions";
  const description =
    language === "ar"
      ? "اعثر على إجابات للأسئلة الشائعة حول منصتنا"
      : "Find answers to common questions about our platform";

  return (
    <div
      className={` h-screen bg-background
        flex flex-col items-center
        ${isRTL ? "rtl" : "ltr"}`}>
      <Header title={title} description={description} />
      <main className="p-6 space-y-6 h-full">
        {translatedFAQs.map((faq, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className={isRTL ? "text-right" : "text-left"}>
                {faq.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-foreground ${
                  isRTL ? "text-right" : "text-left"
                }`}>
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
