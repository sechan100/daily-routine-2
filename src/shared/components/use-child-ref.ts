import { extend } from "lodash";
import { useCallback, useEffect, useRef } from "react"


/**
 * 해당 훅에서 반환하는 ref를 사용하면, ref가 참조하는 엘리먼트의 자식 엘리먼트를 자동으로 추가한다. 
 * 그 자식 엘리먼트를 삭제하거나 조작, 또는 재생성하는 등의 작업을 가능하게한다.
 */
export const useChildRef = <P extends HTMLElement, C extends HTMLElement>(tagName: keyof HTMLElementTagNameMap) => {
  const parentRef = useRef<P>(null);
  const childRef = useRef<C | null>(null);

  // 최초 1회 초기화 실행
  useEffect(() => {
    create();
    return destroy;  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destroy = useCallback(() => {
    if(!parentRef.current || !childRef.current) return;
    parentRef.current.removeChild(childRef.current);
    childRef.current = null;
  }, []);

  /**
   * 이미 있으면 안 만든다.
   */
  const create = useCallback(() => {
    if(!parentRef.current || childRef.current) return;
    const child = document.createElement(tagName);
    parentRef.current.appendChild(child);
    childRef.current = child as C;
  }, [tagName]);


  return {
    parentRef,
    childRef,
    create,
    destroy
  }
}