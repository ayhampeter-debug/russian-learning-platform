export type ExplanationLanguage = "en" | "ar";

export const defaultExplanationLanguage: ExplanationLanguage = "en";
export const explanationLanguageStorageKey = "yazkup.explanationLanguage";

export const explanationLanguageOptions: Array<{
  value: ExplanationLanguage;
  label: string;
  shortLabel: string;
}> = [
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "ar", label: "العربية", shortLabel: "AR" },
];

export function normalizeExplanationLanguage(value: unknown): ExplanationLanguage {
  return value === "ar" ? "ar" : defaultExplanationLanguage;
}

export function getExplanationDirection(language: ExplanationLanguage) {
  return language === "ar" ? "rtl" : "ltr";
}

export function isArabicExplanation(language: ExplanationLanguage) {
  return language === "ar";
}

