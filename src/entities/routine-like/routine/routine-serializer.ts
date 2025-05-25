import { fileAccessor } from "@/shared/file/file-accessor";
import dedent from "dedent";
import { Notice, stringifyYaml, TFile } from "obsidian";
import { RoutineEntity } from "./routine";
import { Routine } from "./routine-type";

/**
 * File을 받아서 Routine 객체로 변환한다.
 * 
 * 루틴을 저장소에서 읽어와 변환하는 로직은 모두 해당 함수를 사용한다.
 * @param file 
 * @returns 
 */
const deserialize = async (file: TFile): Promise<Routine> => {
  const fm = await fileAccessor.loadFrontMatter(file);
  const result = RoutineEntity.validateRoutineProperties(fm);
  if (result.isErr()) {
    new Notice(`Routine '${file.basename}' frontmatter error: ${result.error}`);
    throw new Error(`[Routine '${file.basename}' Parse Error] ${result.error}`);
  }
  return {
    name: file.basename,
    routineElementType: "routine",
    properties: result.value
  }
}

const serialize = (routine: Routine) => dedent`
  ---
  ${stringifyYaml(routine.properties)}
  ---
`;

export const RoutineSerializer = {
  serialize,
  deserialize
}