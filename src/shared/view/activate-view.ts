import { WorkspaceLeaf } from "obsidian";
import { plugin } from "@shared/utils/plugin-service-locator";

/**
  * viewType에 해당하는 뷰를 활성화한다.
  * @param viewTypeName 뷰 타입 이름
  * @param pos -1: left, 0: center(default), 1: right
  * @param reveal true면 접힌 사이드바(모바일 drawer 포함)를 열어서 뷰를 실제로 보여준다
  */
export const activateView = async (viewTypeName: string, pos = 0, reveal = true) => {
  const app = plugin().app;
  let leaf: WorkspaceLeaf | null = app.workspace.getLeavesOfType(viewTypeName)[0] ?? null;

  if(!leaf) {
    if(pos === -1) {
      leaf = app.workspace.getLeftLeaf(false);
    } else if(pos === 0) {
      leaf = app.workspace.getLeaf(false);
    } else {
      leaf = app.workspace.getRightLeaf(false);
    }
    // getLeftLeaf/getRightLeaf는 null을 반환할 수 있다
    if(!leaf) return;
    await leaf.setViewState({ type: viewTypeName, active: reveal });
  }

  if(reveal) {
    await app.workspace.revealLeaf(leaf);
  }
}
