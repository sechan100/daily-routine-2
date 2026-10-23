import { defineStrings } from "./define";


// 캘린더 탭·달성 탭·통계 문구.
export const statsStrings = defineStrings({
  en: {
    // 달성 탭 하위 탭
    "stats.achievement.noteTab": "Note",
    "stats.achievement.routineTab": "Routine",

    // 노트 달성 요약
    "stats.note.done": "Done",
    "stats.note.doneHint": "Accomplished tasks out of all tasks on days with a note, up to today",
    "stats.note.perfectDays": "Perfect days",
    "stats.note.perfectDaysHint": "Days on which every task was accomplished",
    "stats.note.daysTracked": "Days tracked",
    "stats.note.daysTrackedHint": "Days with a note, up to today",

    // 루틴 달성 요약·선택
    "stats.routine.done": "Done",
    "stats.routine.doneHint": "Accomplished out of scheduled days in the month shown, up to today",
    "stats.routine.streak": "Streak",
    "stats.routine.streakHint": "Consecutive accomplished days up to today. Days without a note are skipped",
    "stats.routine.best": "Best",
    "stats.routine.bestHint": "Longest streak in the last 365 days",
    "stats.routine.select": "Select routine",
    "stats.routine.noneFound": "No routines found",

    // 캘린더 타일
    "stats.calendar.more": "+{count}",
    // 가려지는 개수는 항상 2 이상이라 복수형만 둔다.
    "stats.calendar.moreTasks": "{count} more tasks",
    "stats.calendar.taskDone": "{name} (done)",
    "stats.calendar.taskFailed": "{name} (failed)",

    // 월 이동 버튼 툴팁
    "stats.nav.previousMonth": "Previous month",
    "stats.nav.nextMonth": "Next month",
    "stats.nav.previousYear": "Previous year",
    "stats.nav.nextYear": "Next year",
  },
  ko: {
    "stats.achievement.noteTab": "노트",
    "stats.achievement.routineTab": "루틴",

    "stats.note.done": "완료",
    "stats.note.doneHint": "오늘까지 노트가 있는 날의 전체 항목 중 완료한 항목의 비율",
    "stats.note.perfectDays": "모두 완료한 날",
    "stats.note.perfectDaysHint": "모든 항목을 완료한 날",
    "stats.note.daysTracked": "기록한 날",
    "stats.note.daysTrackedHint": "오늘까지 노트가 있는 날",

    "stats.routine.done": "완료",
    "stats.routine.doneHint": "이 달에 예정된 날 중 오늘까지 완료한 날",
    "stats.routine.streak": "연속",
    "stats.routine.streakHint": "오늘까지 연속으로 완료한 날 수. 노트가 없는 날은 건너뜁니다",
    "stats.routine.best": "최고 기록",
    "stats.routine.bestHint": "최근 365일 중 가장 긴 연속 기록",
    "stats.routine.select": "루틴 선택",
    "stats.routine.noneFound": "루틴이 없습니다",

    "stats.calendar.more": "+{count}",
    "stats.calendar.moreTasks": "항목 {count}개 더",
    "stats.calendar.taskDone": "{name} (완료)",
    "stats.calendar.taskFailed": "{name} (실패)",

    "stats.nav.previousMonth": "이전 달",
    "stats.nav.nextMonth": "다음 달",
    "stats.nav.previousYear": "이전 연도",
    "stats.nav.nextYear": "다음 연도",
  },
});
