// Translation system using JSON files
import enTranslations from "@/locales/en.json";
import arTranslations from "@/locales/ar.json";

export type Language = "en" | "ar";

// Import JSON files as translation objects
const translations = {
  en: enTranslations,
  ar: arTranslations,
} as const;

// Allow dynamic section/key strings to reduce friction when migrating strings
export type TranslationSection = string;
export type TranslationKey<T extends string> = string;

export function getTranslation(
  language: Language,
  section: string,
  key: string
): string {
  // Use any internally to allow flexible nested lookups
  const langSection = (translations as any)[language]?.[section] as
    | Record<string, any>
    | undefined;
  const enSection = (translations as any).en?.[section] as
    | Record<string, any>
    | undefined;

  const keyStr = key as string;

  // Support dot-notation nested keys (e.g. "pricing.features.support")
  if (keyStr.includes(".")) {
    const keys = keyStr.split(".");
    let value: any = langSection;
    let fallbackValue: any = enSection;

    for (const k of keys) {
      value = value?.[k];
      fallbackValue = fallbackValue?.[k];
    }

    return (value ?? fallbackValue ?? keyStr) as string;
  }

  return (langSection?.[keyStr] ?? enSection?.[keyStr] ?? keyStr) as string;
}
