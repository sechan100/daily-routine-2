import { defineStrings } from "./define";


// 여러 영역에서 함께 쓰는 짧은 문구.
export const commonStrings = defineStrings({
  en: {
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.remove": "Remove",
    "common.name": "Name",
    "common.tags": "Tags",
    "common.showOnCalendar": "Show on calendar",
    "common.today": "Today",
    "common.loading": "Loading…",
    "common.legacyNoteNameConflict": "[Daily Routine] Some notes were saved with non-Latin digits in their file names by an older version, and a note for the same day already exists. Please merge them by hand: {paths}",
  },
  ko: {
    "common.save": "저장",
    "common.cancel": "취소",
    "common.delete": "삭제",
    "common.edit": "편집",
    "common.create": "만들기",
    "common.remove": "제거",
    "common.name": "이름",
    "common.tags": "태그",
    "common.showOnCalendar": "캘린더에 표시",
    "common.today": "오늘",
    "common.loading": "불러오는 중…",
    "common.legacyNoteNameConflict": "[Daily Routine] 이전 버전이 다른 숫자 체계로 이름을 붙인 노트가 있는데, 같은 날짜의 노트가 이미 있습니다. 직접 합쳐 주세요: {paths}",
  },
});
