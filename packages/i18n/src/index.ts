import { en, type MessageKey } from "./messages/en";
import { cy } from "./messages/cy";

export type { MessageKey };

export const INTERFACE_LOCALES = ["en", "cy"] as const;
export type InterfaceLocale = (typeof INTERFACE_LOCALES)[number];

const CATALOGS: Record<InterfaceLocale, Record<MessageKey, string>> = { en, cy };

/** Look up a message; falls back to English if the key is missing in a catalog. */
export function t(locale: InterfaceLocale, key: MessageKey): string {
  return CATALOGS[locale][key] ?? en[key];
}

export function catalog(locale: InterfaceLocale): Record<MessageKey, string> {
  return CATALOGS[locale];
}
