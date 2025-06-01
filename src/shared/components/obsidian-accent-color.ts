




type HSLA = {
  h: number;
  s: number;
  l: number;
  a: number;
}

export const getAccent = (partialHsla: Partial<HSLA> = {
  h: 1,
  s: 1,
  l: 1,
  a: 1,
}) => {
  const { h, s, l, a } = {
    h: partialHsla.h ?? 1,
    s: partialHsla.s ?? 1,
    l: partialHsla.l ?? 1,
    a: partialHsla.a ?? 1,
  }

  return `hsla(calc(var(--accent-h) * ${h}), calc(var(--accent-s) * ${s}), calc(var(--accent-l) * ${l}), ${a})`;
}