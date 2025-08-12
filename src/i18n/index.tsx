import * as React from "react";

export type Locale = "en" | "el";

type Dict = Record<string, string>;

const dictionaries: Record<Locale, Dict> = {
  en: {
    language: "Language",
    english: "English",
    greek: "Greek",
    save: "Save",
    cancel: "Cancel",
  },
  el: {
    language: "Γλώσσα",
    english: "Αγγλικά",
    greek: "Ελληνικά",
    save: "Αποθήκευση",
    cancel: "Ακύρωση",
  },
};

export interface I18nContextValue {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('locale')) as Locale | null;
    return saved || 'en';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('locale', locale);
  }, [locale]);

  const value = React.useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key: string) => dictionaries[locale]?.[key] ?? key,
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
