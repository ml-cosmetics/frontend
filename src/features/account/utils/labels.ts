import type { AccountGender, AccountLanguage, AccountTimeFormat } from "@/types";

/**
 * Vietnamese label for the operator's role / badge.
 */
export function getGenderLabel(gender: AccountGender | null | undefined): string {
  switch (gender) {
    case "female":
      return "Nữ";
    case "male":
      return "Nam";
    case "other":
      return "Khác";
    default:
      return "—";
  }
}

/**
 * Vietnamese label for the operator's chosen UI language.
 */
export function getLanguageLabel(language: AccountLanguage): string {
  switch (language) {
    case "vi":
      return "Tiếng Việt";
    case "en":
      return "English";
    default:
      return language;
  }
}

/**
 * Vietnamese label for the 12h / 24h time format toggle.
 */
export function getTimeFormatLabel(format: AccountTimeFormat): string {
  switch (format) {
    case "12h":
      return "12-hour (02:00 PM)";
    case "24h":
    default:
      return "24-hour (14:00)";
  }
}
