

type Switch<R> = { [key: string | number]: R };


export const switchTo = <R>(
  key: string | number,
  cases: Switch<R>,
  defaultCase?: R
): R => {
  if (defaultCase) {
    return key in cases ? cases[key] : defaultCase;
  } else {
    if (key in cases) {
      return cases[key];
    } else {
      throw new Error(`Invalid key: ${key}`);
    }
  }
}