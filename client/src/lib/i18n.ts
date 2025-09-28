// Translation system using JSON files
import enTranslations from "@/locales/en.json";
import arTranslations from "@/locales/ar.json";

export type Language = "en" | "ar";

// Import JSON files as translation objects
const translations = {
  en: enTranslations,
  ar: arTranslations,
} as const;

export type TranslationSection = keyof typeof translations.en;
export type TranslationKey<T extends TranslationSection> =
  keyof (typeof translations.en)[T];

export function getTranslation<T extends TranslationSection>(
  language: Language,
  section: T,
  key: TranslationKey<T>
): string {
  const langSection = translations[language]?.[section] as
    | Record<string, any>
    | undefined;
  const enSection = translations.en[section] as Record<string, any>;

  // Handle nested objects (like faq.questions.*)
  const keyStr = key as string;
  if (keyStr.includes(".")) {
    const keys = keyStr.split(".");
    let value: any = langSection;
    let fallbackValue: any = enSection;

    for (const k of keys) {
      value = value?.[k];
      fallbackValue = fallbackValue?.[k];
    }

    return (
      (value as unknown as string) ??
      (fallbackValue as unknown as string) ??
      keyStr
    );
  }

  // Handle simple keys
  return (
    (langSection?.[keyStr] as string) ??
    (enSection?.[keyStr] as string) ??
    keyStr
  );
}
