/* eslint-disable @typescript-eslint/no-explicit-any */
type Func<T = any, R = any> = (arg: T) => R;

export function compose(...funcs: Func[]): Func {
  return (arg: any): any => funcs.reduceRight((result, fn) => fn(result), arg);
}
