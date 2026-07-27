"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { t as translate, type InterfaceLocale, type MessageKey } from "@virtual-studio/i18n";

interface LocaleContextValue {
  locale: InterfaceLocale;
  setLocale: (locale: InterfaceLocale) => void;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const LOCALE_KEY = "vs.locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<InterfaceLocale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_KEY);
    if (stored === "en" || stored === "cy") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: InterfaceLocale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_KEY, next);
  }, []);

  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
