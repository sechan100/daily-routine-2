





// 변환시에는 0번 인덱스 글자가 우선 사용
export const checkboxChars = {
  accomplished: ['x', 'X'],
  failed: ['f', 'F'],
}

// 플러그인이 관리하는 '# Tasks' 섹션의 heading을 찾는 정규식. 1번 그룹은 heading 앞의 줄바꿈이다.
// 줄 끝은 LF, CRLF, 파일 끝만 인정한다. heading 뒤의 '\r'은 매치에 넣지 않고 줄바꿈의 일부로 섹션 본문에 남긴다.
export const TASKS_HEADING_REGEX = /(^|\n)# Tasks[ \t]*(?=\r?\n|$)/;

// 그룹에 속하지 않은 task들을 묶는 블록의 heading 이름 (RoutineGroupEntity.UNGROUPED_NAME과 같은 예약어)
export const UNGROUPED_HEADING = 'UNGROUPED';