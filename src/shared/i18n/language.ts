import { getLanguage } from "obsidian";


/**
 * 플러그인은 언어를 두 가지로 나눠 쓴다.
 * - UI 문구: 한국어(ko)와 영어(en)만 제공한다. Obsidian 언어가 한국어가 아니면 영어로 보여준다.
 * - 날짜·숫자 표기: Obsidian 언어를 그대로 따른다. (독일어 사용자는 문구는 영어지만 날짜는 '23. Okt.'처럼 본다)
 * 노트 파일 이름·frontmatter처럼 저장되는 값은 언어와 무관하게 Day.format()을 쓴다.
 *
 * Obsidian은 언어를 바꾸면 앱을 다시 불러오므로, 한 번 읽은 값을 계속 쓴다.
 */
export type UiLanguage = "en" | "ko";

let appLanguage: string | null = null;
let dateLocale: string | null = null;

export const getAppLanguage = (): string => {
  if(appLanguage === null) appLanguage = readAppLanguage();
  return appLanguage;
}

export const getUiLanguage = (): UiLanguage => {
  return getAppLanguage().toLowerCase().startsWith("ko") ? "ko" : "en";
}

/**
 * Intl에 넘길 로케일. 플러그인의 달력은 항상 양력이므로, 페르시아력·불기 등을 기본으로 쓰는 언어도 양력으로 표기하게 한다.
 */
export const getDateLocale = (): string => {
  if(dateLocale === null) dateLocale = resolveDateLocale(getAppLanguage());
  return dateLocale;
}

const resolveDateLocale = (lang: string): string => {
  const candidate = `${lang}-u-ca-gregory`;
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([candidate]).length > 0 ? candidate : "en-u-ca-gregory";
  } catch {
    return "en-u-ca-gregory";
  }
}

/** 테스트에서 언어를 바꿔보기 위한 함수. */
export const setAppLanguageForTest = (lang: string | null) => {
  appLanguage = lang;
  dateLocale = null;
}

const readAppLanguage = (): string => {
  // obsidian 모듈을 직접 흉내 내는 테스트에서는 getLanguage가 없을 수 있다.
  return (typeof getLanguage === "function" ? getLanguage() : "") || "en";
}
