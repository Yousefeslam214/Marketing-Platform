import { useLang } from "@/contexts/language-context";

// Re-export useLang as useLanguage for backward compatibility
export function useLanguage() {
  return useLang();
}
