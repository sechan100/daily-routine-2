export type TaskHitArea = "top" | "bottom";

export type GroupHitArea = "top" | "in" | "bottom";


type NodeRect = Pick<DOMRect, "top" | "bottom" | "height">;

type GroupHitOption = {
  // task를 group 안으로 넣을 수 있는지. (group header가 group 전체일 때만: 닫혀 있거나 비어 있음)
  allowIn: boolean;
  // group 아래(다음 위치)에 놓을 수 있는지. 펼쳐진 group의 header 아래는 첫 자식 자리라서, 그 위치를 '아래'로 표시하면 실제 위치와 어긋난다.
  allowBottom: boolean;
}


export const HitAreaEvaluator = {
  /**
   * 가운데 영역은 null을 반환한다. 호출부는 직전 hit을 유지하므로, 경계에서 indicator가 깜빡이지 않는다.
   */
  evaluateTask(y: number, rect: NodeRect): TaskHitArea | null {
    const hitbox = rect.height * 0.40;
    if(y < rect.top + hitbox) return "top";
    if(y > rect.bottom - hitbox) return "bottom";
    return null;
  },

  evaluateGroup(y: number, rect: NodeRect, { allowIn, allowBottom }: GroupHitOption): GroupHitArea | null {
    if(allowIn){
      const hitbox = rect.height * 0.30;
      if(y < rect.top + hitbox) return "top";
      if(allowBottom && y > rect.bottom - hitbox) return "bottom";
      return "in";
    }
    const isUpperHalf = y < rect.top + rect.height / 2;
    if(isUpperHalf) return "top";
    return allowBottom ? "bottom" : null;
  },
}
