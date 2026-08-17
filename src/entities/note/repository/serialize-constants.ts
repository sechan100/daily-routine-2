





// 변환시에는 0번 인덱스 글자가 우선 사용
export const checkboxChars = {
  accomplished: ['x', 'X'],
  failed: ['f', 'F'],
}

// 플러그인이 관리하는 '# Tasks' 섹션의 heading을 찾는 정규식
export const TASKS_HEADING_REGEX = /^# Tasks[ \t]*\r?$/m;