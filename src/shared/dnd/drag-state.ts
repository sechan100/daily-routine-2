

/**
 * idle: 대기 상태
 * charging: 터치 backend인 경우, drag를 위해서 꾹 누르고 있는 상태
 * ready: 드래그를 시작할 준비가 된 상태
 * dragging: 드래그 중인 상태
 */
export type DragState = "idle" | "charging" | "ready" | "dragging";
