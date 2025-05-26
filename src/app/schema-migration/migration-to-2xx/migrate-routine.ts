/* eslint-disable @typescript-eslint/no-explicit-any */
import { fileAccessor } from "@/shared/file/file-accessor";
import { DayOfWeek } from "@/shared/period/day";
import dedent from "dedent";
import { keys } from "lodash";
import { Notice, TFile } from "obsidian";


const err = (message: string, filePath?: string): Error => {
  const msg = filePath ? `${message} (in file: ${filePath})` : message;
  new Notice(msg);
  return new Error(msg);
}

const validate1xxSchemaRoutineProperties = (file: TFile, p: any): unknown => {
  if (typeof p !== 'object') {
    throw err('The frontmatter format is invalid. Please check the structure of your routine.', file.path);
  }

  if ('order' in p && typeof p.order === 'number') {
    if (p.order < 0) throw err('The "order" property must be a non-negative number.', file.path);
  } else {
    throw err('The "order" property is missing or is not a number. Please add a valid "order" to your routine. ', file.path);
  }

  if ('group' in p && typeof p.group === 'string') {
    //
  } else {
    throw err('The "group" property is missing or is not a valid group name. Please specify a valid group for this routine.', file.path);
  }

  if ('showOnCalendar' in p && typeof p.showOnCalendar === 'boolean') {
    //
  } else {
    throw err('The "showOnCalendar" property is missing or is not a boolean. Please set this to true or false.', file.path);
  }

  if ('activeCriteria' in p && typeof p.activeCriteria === 'string') {
    if (!["week", "month"].includes(p.activeCriteria)) throw err('The "activeCriteria" property must be either "week" or "month".', file.path);
  } else {
    throw err('The "activeCriteria" property is missing or is not a string. Please set it to "week" or "month".', file.path);
  }

  if ('daysOfWeek' in p && Array.isArray(p.daysOfWeek)) {
    for (const d of p.daysOfWeek) {
      if (!keys(DayOfWeek).includes(d)) throw err(`The "daysOfWeek" property contains an invalid value: ${d}. Please use valid day names.`, file.path);
    }
  } else {
    throw err('The "daysOfWeek" property is missing or is not an array of valid days. Please provide an array of day names.', file.path);
  }

  if ('daysOfMonth' in p && Array.isArray(p.daysOfMonth)) {
    for (const d of p.daysOfMonth) {
      if (typeof d !== 'number') throw err(`The "daysOfMonth" property must only contain numbers. Invalid value: ${d}.`, file.path);
      if (d < 0 || d > 31) throw err(`The "daysOfMonth" property must be between 0 and 31. Invalid value: ${d}.`, file.path);
    }
  } else {
    throw err('The "daysOfMonth" property is missing or is not an array of numbers. Please provide an array of valid dates.', file.path);
  }

  if ('enabled' in p && typeof p.enabled === 'boolean') {
    //
  } else {
    throw err('The "enabled" property is missing or is not a boolean. Please set this to true or false.', file.path);
  }

  return p;
}


export const migrateRoutine = async (file: TFile) => {
  // frontmatter 가져오고 검사
  const _fm = await fileAccessor.loadFrontMatter(file);
  validate1xxSchemaRoutineProperties(file, _fm);

  const fm = _fm as {
    order: number;
    group: string;
    showOnCalendar: boolean;
    activeCriteria: "week" | "month";
    daysOfWeek: DayOfWeek[];
    daysOfMonth: number[];
    enabled: boolean;
  };

  // frontmatter object를 새로운 형식으로 변환
  const newProperties = {
    order: fm.order,
    group: fm.group,
    showOnCalendar: fm.showOnCalendar,
    recurrenceUnit: fm.activeCriteria,
    daysOfWeek: fm.daysOfWeek,
    daysOfMonth: fm.daysOfMonth,
    enabled: fm.enabled,
  }

  const newRoutineFileContent = dedent`
  \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n
  ---
  %% Please do not modify the content below. It may damage your Routine data. %%
  %% daily-routine
  \`\`\`
  ${JSON.stringify(newProperties, null, 0)}
  \`\`\`
  %%
  `

  // 새로운 frontmatter로 파일 내용 업데이트
  await fileAccessor.writeFile(file, () => newRoutineFileContent);
}