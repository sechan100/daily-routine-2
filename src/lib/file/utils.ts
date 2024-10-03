

/**
 * 파일 내용으로부터 property를 추출한다. 
 * @param content 파일 내용
 * @returns property 객체: { [key: string]: string; }
 * property에서 문자열이 없는 경우, 빈 문자열로 반환한다.
 */
export const parseProperties = (content: string): { [key: string]: string; } => {
  // 매칭
  const propertyString = content.replace("\n", "").match(/---([\s\S]*?)---/)?.[1];
  if(!propertyString) {
  throw new Error('Routine file does not have property.');
  }

  // 파싱
  const props = propertyString.split('\n');
  return props.slice(0, props.length - 1).map(line => {
    const [k, v] = line.split(':');
    if(k === undefined || k === "") throw new Error('Invalid property format.');

    const value = (v !== undefined && v !== '') ? v.trim() : "";
    return { [k.trim()]: value };
  })
  .reduce((acc, cur) => ({ ...acc, [cur.key]: cur.value }));
}


/**
 * property 객체를 파일 내용으로 변환한다.
 * @param properties property 객체. { [key: string]: valueSupplier}
 */
export const serializeProperties = (properties: { [key: string]: () => string; }): string => {
  return `---\n${Object.keys(properties).map(key => `${key}: ${properties[key]()}`).join('\n')}---\n`;
}


/**
 * regex matching
 */
const matchProperties = (content: string) => {
  const matched = content.match(/---\n([\s\S]*?)\n---/);
  if(!matched) {
    throw new Error('Routine file does not have property.');
  }
  return matched[0];
}


export const changeProperties = (content: string, newProperties: { [key: string]: () => string; }): string => {
  const newPropertiesString = serializeProperties(newProperties);
  return content.replace(matchProperties(content), newPropertiesString);
}