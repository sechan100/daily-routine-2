import { defineStrings } from "./define";


// 앱 셸·노트 화면·주간 표시줄·명령·설정·오류 화면 문구.
export const shellStrings = defineStrings({
  en: {
    // 하단 탭과 뷰 제목
    "shell.tab.note": "Note",
    "shell.tab.calendar": "Calendar",
    "shell.tab.achievement": "Achievement",
    "shell.view.title": "Routine",

    // 명령·메뉴·버튼에서 함께 쓰는 동작 이름
    "shell.action.addTodo": "Add todo",
    "shell.action.startRoutine": "Start new routine",
    "shell.action.addGroup": "Add group",
    "shell.action.syncNotes": "Sync notes with routines",
    "shell.action.goToToday": "Go to today",

    // 명령 팔레트
    "shell.command.openView": "Open routine view",
    "shell.command.previousDay": "Previous day",
    "shell.command.nextDay": "Next day",
    "shell.command.openTodayNote": "Open today's routine note",
    "shell.command.openViewFailed": "Failed to open the routine view.",
    "shell.command.todayNoteMissing": "Could not find today's routine note.",
    "shell.command.openTodayNoteFailed": "Failed to open today's routine note.",

    // 노트 화면
    "shell.note.empty": "No tasks for this day",
    "shell.note.moreOptions": "More options",
    "shell.note.synced": "Notes synced with routines.",
    "shell.note.loadFailed": "Failed to load routine note: {message}",
    "shell.note.loadDayFailed": "Failed to load the routine note for {date}.",

    // 오류 화면
    "shell.error.title": "Daily Routine crashed",
    "shell.error.retry": "Retry",

    // 설정
    "shell.settings.folderPath.name": "Daily routine folder path",
    "shell.settings.folderPath.desc": "This is the path to the folder where the Daily Routine plugin saves notes, routines, and other data.",
    "shell.settings.weekStart.name": "Start of week",
    "shell.settings.weekStart.desc": "Sets the first day of the week in the week strip and the calendars.",
    "shell.settings.weekStart.monday": "Monday",
    "shell.settings.weekStart.sunday": "Sunday",
    "shell.settings.weekStart.saturday": "Saturday",
    "shell.settings.confirmUncheck.name": "Confirm before unchecking a task",
    "shell.settings.confirmUncheck.desc": "When you uncheck a task, a confirmation dialog will appear.",
    "shell.settings.routineOnCalendar.name": "Show new routines on calendar",
    "shell.settings.routineOnCalendar.desc": "Only applies to routines created from now on. Existing routines keep their own value.",
    "shell.settings.todoOnCalendar.name": "Show new todos on calendar",
    "shell.settings.todoOnCalendar.desc": "Only applies to todos created from now on. Existing todos keep their own value.",
  },
  ko: {
    "shell.tab.note": "노트",
    "shell.tab.calendar": "캘린더",
    "shell.tab.achievement": "달성",
    "shell.view.title": "루틴",

    "shell.action.addTodo": "할 일 추가",
    "shell.action.startRoutine": "새 루틴 시작",
    "shell.action.addGroup": "그룹 추가",
    "shell.action.syncNotes": "루틴 변경사항을 노트에 반영",
    "shell.action.goToToday": "오늘로 이동",

    "shell.command.openView": "루틴 뷰 열기",
    "shell.command.previousDay": "이전 날로 이동",
    "shell.command.nextDay": "다음 날로 이동",
    "shell.command.openTodayNote": "오늘의 루틴 노트 열기",
    "shell.command.openViewFailed": "루틴 뷰를 열지 못했습니다.",
    "shell.command.todayNoteMissing": "오늘의 루틴 노트를 찾지 못했습니다.",
    "shell.command.openTodayNoteFailed": "오늘의 루틴 노트를 열지 못했습니다.",

    "shell.note.empty": "이날에는 항목이 없습니다",
    "shell.note.moreOptions": "더 보기",
    "shell.note.synced": "루틴 변경사항을 노트에 반영했습니다.",
    "shell.note.loadFailed": "루틴 노트를 불러오지 못했습니다: {message}",
    "shell.note.loadDayFailed": "{date} 루틴 노트를 불러오지 못했습니다.",

    "shell.error.title": "Daily Routine에 문제가 발생했습니다",
    "shell.error.retry": "다시 시도",

    "shell.settings.folderPath.name": "루틴 폴더 경로",
    "shell.settings.folderPath.desc": "Daily Routine 플러그인이 노트, 루틴 등의 데이터를 저장하는 폴더 경로입니다.",
    "shell.settings.weekStart.name": "주 시작 요일",
    "shell.settings.weekStart.desc": "노트 화면의 주간 표시줄과 캘린더에서 한 주가 시작되는 요일입니다.",
    "shell.settings.weekStart.monday": "월요일",
    "shell.settings.weekStart.sunday": "일요일",
    "shell.settings.weekStart.saturday": "토요일",
    "shell.settings.confirmUncheck.name": "항목 체크 해제 시 확인",
    "shell.settings.confirmUncheck.desc": "항목의 체크를 해제하면 확인 창이 나타납니다.",
    "shell.settings.routineOnCalendar.name": "새 루틴을 캘린더에 표시",
    "shell.settings.routineOnCalendar.desc": "지금부터 만드는 루틴에만 적용됩니다. 기존 루틴은 각자의 설정을 유지합니다.",
    "shell.settings.todoOnCalendar.name": "새 할 일을 캘린더에 표시",
    "shell.settings.todoOnCalendar.desc": "지금부터 만드는 할 일에만 적용됩니다. 기존 할 일은 각자의 설정을 유지합니다.",
  },
});
