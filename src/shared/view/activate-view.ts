import { WorkspaceLeaf } from "obsidian";
import { plugin } from "@shared/utils/plugin-service-locator";

/**
  * viewType에 해당하는 뷰를 활성화한다.
  * @param viewTypeName 뷰 타입 이름
  * @param pos -1: left, 0: center(default), 1: right
  */
export const activateView = async (viewTypeName: string, pos = 0) => {
  const app = plugin().app;
  let leaf = app.workspace.getLeavesOfType(viewTypeName)[0];

  let getLeaf;
  if(pos === -1) {
    getLeaf = () => app.workspace.getLeftLeaf(false)
  } else if(pos === 0) {
    getLeaf = () => app.workspace.getLeaf(false)
  } else {
    getLeaf = () => app.workspace.getRightLeaf(false)
  }

  if(!leaf) {
    leaf = getLeaf() as WorkspaceLeaf;
    await leaf.setViewState({ type: viewTypeName, active: false });
  }

}