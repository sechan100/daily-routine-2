/**
 * 영역별 문구 표를 정의한다. ko는 en과 같은 키를 빠짐없이 가져야 한다(빠지거나 남는 키는 타입 오류).
 * 문구 안의 {name}은 t(key, { name })으로 채운다.
 */
export const defineStrings = <K extends string>(strings: { en: Record<K, string>; ko: Record<K, string> }) => strings;
