import { fileAccessor } from "@/shared/file/file-accessor";
import dedent from "dedent";
import { stringifyYaml, TFile } from "obsidian";
import { RoutineGroup } from "../routine/routine-type";
import { GROUP_PREFIX } from "../utils";
import { RoutineGroupEntity } from "./routine-group";



const deserialize = async (file: TFile): Promise<RoutineGroup> => {
  const fm = await fileAccessor.loadFrontMatter(file);
  const name = file.basename.startsWith(GROUP_PREFIX) ? file.basename.slice(GROUP_PREFIX.length) : file.basename;
  const properties = RoutineGroupEntity.validateGroupProperties(fm);
  if (properties.isErr()) throw new Error(`[RoutineGroup '${name}' Parse Error] ${properties.error}`);

  return {
    routineElementType: "routine-group",
    name: name,
    properties: properties.value
  }
}

const serialize = (group: RoutineGroup) => dedent`
  ---
  ${stringifyYaml(group.properties)}
  ---
`;


export const GroupSerializer = {
  deserialize,
  serialize
};