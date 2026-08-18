type Func<T = unknown, R = unknown> = (arg: T) => R;

export function compose(...funcs: Func[]): Func {
  return (arg: unknown): unknown => funcs.reduceRight((result, fn) => fn(result), arg);
}
