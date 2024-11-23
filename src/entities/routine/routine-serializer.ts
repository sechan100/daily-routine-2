import { Routine } from "./routine";
import { RoutineFrontMatterParser } from "./routine-frontmatter-parser";


interface RoutineSerializer {
  serialize(routine: Routine): string;
  deserialize(name: string, content: string): Routine;
}

export const routineSerializer: RoutineSerializer = {

  serialize(routine: Routine) {
    const properties = RoutineFrontMatterParser.serialize(routine.properties);
    const content = "";
  
    return `${properties}\n${content}`;
  },
  
  deserialize(name: string, content: string): Routine {  
    const properties = RoutineFrontMatterParser.deserialize(content);
    return {
      name,
      properties
    }
  }
  
}