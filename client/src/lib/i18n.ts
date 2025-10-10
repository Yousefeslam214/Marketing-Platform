// Translation system using JSON files
import enTranslations from "@/locales/en.json";
import arTranslations from "@/locales/ar.json";

export type Language = "en" | "ar";

// Import JSON files as translation objects
const translations = {
  en: enTranslations,
  ar: arTranslations,
} as const;

// Allow any string section to support dot-paths and dynamic sections used across the app.
export type TranslationSection = string;
// Allow string keys (including nested dot-paths) for flexibility in templates
export type TranslationKey<T extends TranslationSection> = string;

export function getTranslation<T extends TranslationSection>(
  language: Language,
  section: T,
  key: string
): string {
  const langSection = translations[language]?.[section] as
    | Record<string, unknown>
    | undefined;
  const enSection = translations.en[section] as Record<string, unknown>;

  // Handle nested objects (like faq.questions.*)
  const keyStr = key;
  if (keyStr.includes(".")) {
    const keys = keyStr.split(".");
  let value: unknown = langSection;
  let fallbackValue: unknown = enSection;

    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
      fallbackValue = (fallbackValue as Record<string, unknown>)?.[k];
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
