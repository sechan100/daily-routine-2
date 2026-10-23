import { ROUTINE_ARCHIVE_PATH } from "@entities/note";
import { NoteViewAction, noteViewEvents, resolveRoutineNote } from "@features/note";
import { t } from "@shared/i18n";
import { Day } from "@shared/period/day";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { activateView } from "@shared/view/activate-view";
import { Notice, Plugin } from "obsidian";
import { DailyRoutineObsidianView } from "./obsidian-view";
import { DAILY_ROUTINE_ICON_NAME } from "./ui/daily-routine-icon";


const VIEW_TYPE = DailyRoutineObsidianView.VIEW_TYPE;
// 뷰를 처음 만들 때 둘 위치(오른쪽 사이드바)
const VIEW_POSITION = 1;


export const registerCommands = (plugin: Plugin) => {
  plugin.addCommand({
    // 사용자가 이 id에 단축키를 걸어두었을 수 있으므로 바꾸지 않는다. (plugin id가 들어 있다는 lint 경고는 감수한다)
    id: "daily-routine-open-routine-view",
    icon: DAILY_ROUTINE_ICON_NAME,
    name: t("shell.command.openView"),
    callback: () => {
      void activateView(VIEW_TYPE, VIEW_POSITION);
    }
  });

  plugin.addCommand({
    id: "add-todo",
    icon: "list-plus",
    name: t("shell.action.addTodo"),
    callback: () => void runOnNoteView({ type: "add-todo" }),
  });

  plugin.addCommand({
    id: "start-new-routine",
    icon: "alarm-clock-plus",
    name: t("shell.action.startRoutine"),
    callback: () => void runOnNoteView({ type: "start-routine" }),
  });

  plugin.addCommand({
    id: "go-to-today",
    icon: "calendar-check",
    name: t("shell.action.goToToday"),
    callback: () => void runOnNoteView({ type: "go-to-today" }),
  });

  plugin.addCommand({
    id: "previous-day",
    icon: "chevron-left",
    name: t("shell.command.previousDay"),
    callback: () => void runOnNoteView({ type: "shift-day", offset: -1 }),
  });

  plugin.addCommand({
    id: "next-day",
    icon: "chevron-right",
    name: t("shell.command.nextDay"),
    callback: () => void runOnNoteView({ type: "shift-day", offset: 1 }),
  });

  plugin.addCommand({
    id: "open-today-note",
    icon: "file-text",
    name: t("shell.command.openTodayNote"),
    callback: () => void openTodayNoteFile(plugin),
  });
}


/**
 * 뷰를 드러내고 노트 탭으로 전환한 뒤, 노트 화면에 동작을 전달한다.
 */
const runOnNoteView = async (action: NoteViewAction) => {
  try {
    await activateView(VIEW_TYPE, VIEW_POSITION);
  } catch(e) {
    console.error("[Daily Routine] Failed to open the routine view.", e);
    new Notice(t("shell.command.openViewFailed"));
    return;
  }

  const { tab, route } = useTabRoute.getState();
  if(tab !== "note"){
    // 다른 탭에서 노트 탭으로 올 때는 탭을 눌렀을 때처럼 오늘을 기준으로 한다.
    if(action.type === "go-to-today" || action.type === "shift-day"){
      const offset = action.type === "shift-day" ? action.offset : 0;
      route("note", { day: Day.today().clone(m => m.add(offset, "day")) });
      return;
    }
    route("note", { day: Day.today() });
  }
  // 노트 화면이 아직 마운트되지 않았다면(뷰를 막 열었거나 노트 탭으로 막 전환) 마운트될 때 전달된다.
  noteViewEvents.dispatch(action);
}


/**
 * 오늘의 루틴 노트 파일을 에디터에서 연다. 아직 없다면 루틴으로부터 만들어 저장한 뒤 연다.
 */
const openTodayNoteFile = async (plugin: Plugin) => {
  const today = Day.today();
  try {
    await resolveRoutineNote(today);
    const file = plugin.app.vault.getFileByPath(ROUTINE_ARCHIVE_PATH(today));
    if(!file){
      new Notice(t("shell.command.todayNoteMissing"));
      return;
    }
    await plugin.app.workspace.getLeaf(false).openFile(file);
  } catch(e) {
    console.error("[Daily Routine] Failed to open today's routine note.", e);
    new Notice(t("shell.command.openTodayNoteFailed"));
  }
}
