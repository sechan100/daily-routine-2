import { useLeaf } from "@/shared/view/use-leaf";



export const num_tabsHeight = 50;
export const num_tabsBottomGap = 25;


/**
 * view가 확실히 렌더링된 이후인지 주의.
 */
export const useTabHeight = () => {
  const view = useLeaf(s => s.view);
  const height = getComputedStyle(view.contentEl).height;
  return parseFloat(height) - (num_tabsHeight + num_tabsBottomGap);
};
