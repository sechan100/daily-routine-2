/* eslint-disable @typescript-eslint/no-explicit-any */
import { fileAccessor } from "@/shared/file/file-accessor";
import dedent from "dedent";
import { Notice, TFile } from "obsidian";


const err = (message: string, filePath?: string): Error => {
  const msg = filePath ? `${message} (in file: ${filePath})` : message;
  new Notice(msg);
  return new Error(msg);
}

const validate1xxSchemaGroupProperties = (file: TFile, p: any): unknown => {
  if (typeof p !== 'object') {
    throw err('The frontmatter format is invalid. Please check the structure of your routine group.', file.path);
  }

  if ('order' in p && typeof p.order === 'number') {
    if (p.order < 0) throw err('The "order" property must be a non-negative number.', file.path);
  } else {
    throw err('The "order" property is missing or is not a number. Please add a valid "order" to your routine group. ', file.path);
  }
  return p;
}


export const migrateGroup = async (file: TFile) => {
  // frontmatter 가져오고 검사
  const _fm = await fileAccessor.loadFrontMatter(file);
  validate1xxSchemaGroupProperties(file, _fm);

  const fm = _fm as {
    order: number;
  };

  // frontmatter object를 새로운 형식으로 변환
  const newProperties = {
    order: fm.order,
  }

  const newRoutineFileContent = dedent`
  \n\n\n\n
  ---
  %% Please do not modify the content below. It may damage your Group data. %%
  %% daily-routine
  \`\`\`
  ${JSON.stringify(newProperties, null, 0)}
  \`\`\`
  %%
  `

  // 새로운 frontmatter로 파일 내용 업데이트
  await fileAccessor.writeFile(file, () => newRoutineFileContent);
}