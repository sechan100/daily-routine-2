

type Switch<T, R> = { [key: string]: R };


export const switchTo = <T extends string | number, R>(
  key: T,
  cases: Switch<T, R>,
  defaultCase?: R
): R => {
  if(defaultCase){
    return key in cases ? cases[key] : defaultCase;
  } else {
    if(key in cases){
      return cases[key];
    } else {
      throw new Error(`Invalid key: ${key}`);
    }
  }
}