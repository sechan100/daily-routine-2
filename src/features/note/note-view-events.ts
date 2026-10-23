import mitt from "mitt";


/**
 * 명령(command palette, 단축키)이 노트 화면에 전달하는 동작.
 */
export type NoteViewAction =
  | { type: "add-todo" }
  | { type: "start-routine" }
  | { type: "go-to-today" }
  | { type: "shift-day"; offset: number };

type NoteViewEvents = {
  action: NoteViewAction;
};

/**
 * 뷰를 막 연 직후에는 노트를 불러오는 중이라 노트 화면이 아직 구독하지 않았다.
 * 그 사이에 보낸 동작은 보관했다가 구독 시점에 전달한다.
 * 뷰가 끝내 열리지 않은 경우 한참 뒤에 엉뚱한 시점에 실행되지 않도록 유효 시간을 둔다.
 */
const PENDING_TTL_MS = 5000;

const emitter = mitt<NoteViewEvents>();
let pending: { action: NoteViewAction; at: number } | null = null;

export const noteViewEvents = {
  dispatch(action: NoteViewAction) {
    const hasSubscriber = (emitter.all.get("action")?.length ?? 0) > 0;
    if(hasSubscriber){
      pending = null;
      emitter.emit("action", action);
    } else {
      pending = { action, at: Date.now() };
    }
  },

  /**
   * @returns 구독 해제 함수
   */
  subscribe(handler: (action: NoteViewAction) => void): () => void {
    emitter.on("action", handler);
    const p = pending;
    pending = null;
    if(p && Date.now() - p.at < PENDING_TTL_MS) handler(p.action);
    return () => emitter.off("action", handler);
  },
};
