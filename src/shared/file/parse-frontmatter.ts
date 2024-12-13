import { getFrontMatterInfo, parseYaml } from "obsidian";


export const parseFrontmatter = (fileContent: string) => {
  const fmInfo = getFrontMatterInfo(fileContent);
  if(!fmInfo.exists){
    throw new Error('File frontmatter is not found.');
  }
  const yaml = fmInfo.frontmatter.replace('---', '').trim()
  return parseYaml(yaml);
}