





export const getCustomAccentHSL = ({
  h = 1,
  s = 1,
  l = 1,
  a = 1,
}: {
  h?: number;
  s?: number;
  l?: number;
  a?: number;
}) => {
  return `hsla(calc(var(--accent-h) * ${a}), calc(var(--accent-s) * ${s}), calc(var(--accent-l) * ${l}), ${a})`;
}