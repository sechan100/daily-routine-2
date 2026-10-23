import { err, ok, Result } from "neverthrow";


// 그룹 파일의 접두사(entities/routine/repository/utils의 GROUP_PREFIX)와 같아야 한다.
// 접두사로 시작하는 루틴 파일은 그룹으로 읽히므로, entities 의존을 피하려고 값만 복제했다.
const RESERVED_GROUP_FILE_PREFIX = "_g_";

// 노트 포맷에 쓰이는 문자(: / \ # [ ] | ^)와, Windows·모바일에서 파일명으로 쓸 수 없는 문자(* " < > ?)
const INVALID_CHARS_REGEX = /[:/\\#[\]|^*"<>?]/;

// 위 정규식의 문자를 사용자에게 보여줄 때 쓰는 목록. 안내 문구는 언어마다 다르지만 문자 목록은 같다.
export const INVALID_TITLE_CHARS_TEXT = `: / \\ # [ ] | ^ * " < > ?`;

/**
 * 파일 제목으로 쓸 수 있는지 검증하고, 앞뒤 공백을 제거한 제목을 반환한다.
 *
 * 에러 코드: 'empty' | 'contains-invalid-characters' | 'starts-or-ends-with-dot' | 'reserved-prefix'
 */
export const validateObsidianFileTitle = (title: string): Result<string, string> => {
  const trimmed = title.trim();
  if(trimmed === ""){
    return err('empty');
  }
  if(INVALID_CHARS_REGEX.test(trimmed)){
    return err('contains-invalid-characters');
  }
  // 앞의 '.'은 숨김 파일이 되고, Windows는 끝의 '.'을 제거해버린다.
  if(trimmed.startsWith(".") || trimmed.endsWith(".")){
    return err('starts-or-ends-with-dot');
  }
  if(trimmed.startsWith(RESERVED_GROUP_FILE_PREFIX)){
    return err('reserved-prefix');
  }
  return ok(trimmed);
}
