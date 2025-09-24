// language-context.tsx
import { createContext, useContext } from "react";
import { useLanguage } from "@/hooks/use-language";

const LanguageContext = createContext<ReturnType<typeof useLanguage> | null>(
  null
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useLanguage();
  return (
    <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
