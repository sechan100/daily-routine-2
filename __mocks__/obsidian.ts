import _moment from "moment";



export abstract class TAbstractFile {
  path: string;
  name: string;
}

export class TFile extends TAbstractFile {
  basename: string;
}

export class TFolder extends TAbstractFile {
  children: TAbstractFile[];
}



export const moment = _moment;

// 테스트 기본 언어. 다른 언어는 @shared/i18n/language의 setAppLanguageForTest로 바꾼다.
export const getLanguage = () => "en";
