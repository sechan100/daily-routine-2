import { Active, Over } from '@dnd-kit/core';
import { DndCollisionType } from './dnd-rect-collision';


/**
 * case는 over를 기준으로 서술됨
 */
export type DndCase =
  // 앞에 삽입
  "insert-before"
  // 뒤에 삽입
  | "insert-after"
  // 첫 번째 자식으로 삽입
  | "insert-into-first"
  // 마지막 자식으로 삽입
  | "insert-into-last"


/**
 * Over는 dnd의 drop 대상, Active는 드래그 중인 대상
 */
export type DndCollision = {
  /**
   * over가 folder인지
   */
  isOverFolder: boolean;

  /**
   * over가 열려있는 상태인지
   */
  isOverOpen: boolean;

  /**
   * active가 over와 충돌(겹쳐진)한 위치에 대한 정보
   */
  collisionType: DndCollisionType;

  over: Over;
  active: Active;
}


export const resolveDndCase = ({ isOverFolder, isOverOpen, collisionType, active, over }: DndCollision): DndCase | null => {
  if (over.id === active.id) return null;

  if (isOverFolder) {
    if (isOverOpen) {
      // 열려있는 폴더
      switch (collisionType) {
        case "above":
          return "insert-before";
        case "below":
          return "insert-into-first";
        case "center":
          return null;
      }
    } else {
      // 닫혀있는 폴더
      switch (collisionType) {
        case "above":
          return "insert-before";
        case "below":
          return "insert-after";
        case "center":
          return "insert-into-last";
      }
    }
  } else {
    // 일반 노드
    switch (collisionType) {
      case "above":
        return "insert-before";
      case "below":
        return "insert-after";
      case "center":
        return null;
    }
  }
}