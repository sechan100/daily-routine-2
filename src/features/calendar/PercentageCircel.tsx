


const cleanPercentage = (percentage: number) => {
  const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0; // we can set non-numbers to 0 here
  const isTooHigh = percentage > 100;
  return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +percentage;
};


interface CircleProps {
  color: string;
  percentage: number;
}
const Circle = ({ color, percentage }: CircleProps) => {
  const r = 85;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - percentage) * circ) / 100; // where stroke will start, e.g. from 15% to 100%.
  return (
    <circle
      r={r}
      cx={100}
      cy={100}
      stroke={strokePct !== circ ? color : ""}
      strokeDasharray={circ}
      strokeWidth={25}
      strokeDashoffset={percentage ? strokePct : 0}
      strokeLinecap="butt"
      fill="transparent"
    ></circle>
  );
};

export const PerCentageCircle = ({ percentage, text }: {percentage: number, text: string}) => {
  const pct = cleanPercentage(percentage);
  const color = pct > 50 ? "hsla(var(--color-accent-1-hsl), 1)" : "hsla(var(--color-accent-2-hsl), 1)";
  return (
    <svg data-percentage={percentage} viewBox="0 0 200 200" className="dr-calendar__percentage-circle">
      <g transform="rotate(-90 100 100)" >
        <Circle color="lightgrey" percentage={100} />
        <Circle color={color} percentage={pct} />
      </g>
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        fontSize="45"
        dominantBaseline="central"
      >
        {text}
      </text>
    </svg>
  );
};