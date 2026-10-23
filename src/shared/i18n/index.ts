import { getUiLanguage } from "./language";
import { commonStrings } from "./strings/common";
import { shellStrings } from "./strings/shell";
import { statsStrings } from "./strings/stats";
import { tasksStrings } from "./strings/tasks";

export { getAppLanguage, getDateLocale, getUiLanguage } from "./language";
export * from "./format";


const en = {
  ...commonStrings.en,
  ...shellStrings.en,
  ...tasksStrings.en,
  ...statsStrings.en,
};
const ko: Record<I18nKey, string> = {
  ...commonStrings.ko,
  ...shellStrings.ko,
  ...tasksStrings.ko,
  ...statsStrings.ko,
};

export type I18nKey = keyof typeof en;
export type I18nParams = Record<string, string | number>;

/**
 * 현재 UI 언어의 문구를 돌려준다. 문구 안의 {name}은 params.name으로 채운다.
 */
export const t = (key: I18nKey, params?: I18nParams): string => {
  const uiLanguage = getUiLanguage();
  const text = (uiLanguage === "ko" ? ko[key] : undefined) ?? en[key] ?? key;
  // 오른쪽→왼쪽 앱(아랍어 등)에서 영어 문구를 그대로 넣으면 문장 끝 문장부호와 이름의 자리가 뒤집혀 보인다.
  // ("Routine 'رياضة' started!" → "!started 'رياضة' Routine") 문구는 왼쪽→오른쪽 격리로, 채우는 값은 방향 자동 격리로 감싼다.
  const isolate = uiLanguage === "en" && isRtlApp();
  const filled = params
    ? text.replace(/\{(\w+)\}/g, (match, name: string) => {
      if(!(name in params)) return match;
      const value = String(params[name]);
      return isolate ? `${FIRST_STRONG_ISOLATE}${value}${POP_DIRECTIONAL_ISOLATE}` : value;
    })
    : text;
  return isolate ? `${LEFT_TO_RIGHT_ISOLATE}${filled}${POP_DIRECTIONAL_ISOLATE}` : filled;
}

const LEFT_TO_RIGHT_ISOLATE = "\u2066";
const FIRST_STRONG_ISOLATE = "\u2068";
const POP_DIRECTIONAL_ISOLATE = "\u2069";

// Obsidian은 오른쪽→왼쪽 언어일 때 body에 mod-rtl 클래스를 단다.
const isRtlApp = (): boolean => {
  return typeof document !== "undefined" && document.body?.classList.contains("mod-rtl") === true;
}
