/**
 * 이전 버전(1.0.11 이하)은 Obsidian 언어가 아랍어·페르시아어·힌디어 등이면 날짜를 그 언어의 숫자로 저장했다.
 * ('٢٠٢٦-١٠-٢٣.md', 'intervalStart: ۲۰۲۶-۱۰-۲۳') 저장된 값을 읽을 때 이 숫자들을 아라비아 숫자(0-9)로 바꾼다.
 */

// 각 숫자 체계의 0에 해당하는 코드 포인트. moment가 숫자를 바꿔 쓰는 로케일들의 숫자 체계를 모두 포함한다.
const ZERO_CODE_POINTS = [
  0x0660, // 아랍-인도 숫자 (ar)
  0x06F0, // 확장 아랍-인도 숫자 (fa, ur)
  0x07C0, // 응코
  0x0966, // 데바나가리 (hi, mr, ne)
  0x09E6, // 벵골 (bn)
  0x0A66, // 구르무키 (pa)
  0x0AE6, // 구자라트 (gu)
  0x0B66, // 오리야
  0x0BE6, // 타밀 (ta)
  0x0C66, // 텔루구 (te)
  0x0CE6, // 칸나다 (kn)
  0x0D66, // 말라얄람 (ml)
  0x0E50, // 태국 (th)
  0x0ED0, // 라오 (lo)
  0x0F20, // 티베트 (bo)
  0x1040, // 미얀마 (my)
  0x17E0, // 크메르 (km)
  0x1810, // 몽골
  0xFF10, // 전각 숫자
];

const NON_ASCII_DIGIT = /[^\x20-\x7E]/u;

export const toAsciiDigits = (text: string): string => {
  if(!NON_ASCII_DIGIT.test(text)) return text;
  let result = "";
  for(const char of text){
    const code = char.codePointAt(0) ?? 0;
    const zero = ZERO_CODE_POINTS.find(z => code >= z && code <= z + 9);
    result += zero === undefined ? char : String(code - zero);
  }
  return result;
}
