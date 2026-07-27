import { z } from "zod";

/** Content languages supported at the data-model level (spec §13.2, §39). */
export const CONTENT_LANGUAGES = ["en", "cy"] as const;
export const ContentLanguageSchema = z.enum(CONTENT_LANGUAGES);
export type ContentLanguage = z.infer<typeof ContentLanguageSchema>;

/** Project language modes (spec §13.2). */
export const LANGUAGE_MODES = ["EN_ONLY", "CY_ONLY", "SEPARATE", "BILINGUAL"] as const;
export const LanguageModeSchema = z.enum(LANGUAGE_MODES);
export type LanguageMode = z.infer<typeof LanguageModeSchema>;

export function languagesForMode(mode: LanguageMode): readonly ContentLanguage[] {
  switch (mode) {
    case "EN_ONLY":
      return ["en"];
    case "CY_ONLY":
      return ["cy"];
    case "SEPARATE":
    case "BILINGUAL":
      return ["en", "cy"];
  }
}
