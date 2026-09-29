export type Language = "en" | "zh";
export const LANGUAGE_CHANGE_EVENT = "fluid-fabs:language-change";

export function getLanguage(): Language {
  return typeof document !== "undefined" &&
    document.documentElement.lang === "zh-CN"
    ? "zh"
    : "en";
}

export function localize(en: string, zh: string): string {
  return getLanguage() === "zh" ? zh : en;
}
