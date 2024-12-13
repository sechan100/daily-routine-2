import { XYCoord } from "react-dnd";


export type TaskHitArea = "top" | "bottom";

export type GroupHitArea = "top" | "in" | "bottom";

type X = XYCoord["x"];
type Y = XYCoord["y"];

type NodeRect = DOMRect;


// group-bottom은 보류
// const getIsXOnLeft = (x: X, rect: NodeRect): boolean => {
//   // 어차피 getBoundingClientRect()는 마진을 제외하기 떄문에, 왼쪽을 가리킨다는 것은 이미 rect의 x축 방향 경계를 벗어났다는 것이다.
//   return x < rect.left;
// }

export const HitAreaEvaluator = {
  /**
   * @param param0 
   * @param node 
   * @param isLastNode 전체 리스트를 기준으로 가장 마지막 노드인 경우에만 true. 개별 group의 마지막인 경우는 false로 처리해야한다.
   */
  evaluateTask({ x, y }: XYCoord, node: HTMLElement, isLastNode: boolean): TaskHitArea | null {
    const rect: NodeRect = node.getBoundingClientRect();
    const dropTargetHeight = rect.height;
    const hitBoundary = 0.40;
    const hixbox = dropTargetHeight * hitBoundary;
  
    // TOP HIT
    if(y < rect.top + hixbox){
      return "top";

    // BOTTOM HIT
    } else if(y > rect.bottom - hixbox){
      return "bottom";
    // MIDDLE HIT
    } else {
      return null;
    }
  },

  evaluateGroup({ y }: XYCoord, node: HTMLElement, isOpen: boolean): GroupHitArea | null {
    const rect: NodeRect = node.getBoundingClientRect();
    const dropTargetHeight = rect.height;
    const hitBoundary = 0.30;
    const hixbox = dropTargetHeight * hitBoundary;
  
    // TOP HIT
    if(y < rect.top + hixbox){
      return "top";

    // BOTTOM HIT
    } else if(y > rect.bottom - hixbox){
      if(isOpen){
        return null;
      } else {
        return "bottom";
      }
    // MIDDLE HIT
    } else {
      if(isOpen){
        return null;
      } else {
        return "in";
      }
    }
  },
}