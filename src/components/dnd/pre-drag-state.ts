

/**
 * 모바일에서만 사용되는 drag 준비 상태
 * idle: 대기 상태
 * charging: 터치 동작인 경우, drag를 위해서 꾹 누르고 있는 상태
 * ready: 드래그를 시작할 준비가 된 상태
 */
export type PreDragState = "idle" | "charging" | "ready";
