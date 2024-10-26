/** @jsxImportSource @emotion/react */
import { DailyRoutineBEM } from "shared/daily-routine-bem";





interface CheckboxProps {
  bem: DailyRoutineBEM;
}
export const Checkbox = ({ bem }: CheckboxProps) => {
  return (          
    <span
      className={bem("cbx")}
      css={{
        position: "relative",
        top: "calc(1/32 * 1em)",
        display: "inline-block",
        width: "calc(14/16 * 1em)",
        height: "calc(14/16 * 1em)",
        marginRight: "calc(0.5em)",
        border: "calc(1/16 * 1em) solid #c8ccd4",
        borderRadius: "3px",
        cursor: "pointer",
        // 체크표시 V
        "&:before": {
          content: "''",
          position: "absolute",
          top: "50%",
          left: "50%",
          margin: "calc(-5/8 * 1em) 0 0 calc(-5/8 * 1em)",
          width: "calc(5/4 * 1em)",
          height: "calc(5/4 * 1em)",
          borderRadius: "100%",
          background: "hsla(var(--color-accent-1-hsl), 1.0)",
          transform: "scale(0)",
        },
          
        // 체크 이펙트
        "&:after": {
          content: "''",
          position: "absolute",
          top: "calc(5/16 * 1em)",
          left: "calc(5/16 * 1em)",
          width: "calc(1/8 * 1em)",
          height: "calc(1/8 * 1em)",
          borderRadius: "2px",
          boxShadow: "0 calc(9/8 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * 1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), 0 calc(9/8 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * -1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0)",
          transform: "scale(0)",
        },
          
        // 체크된 경우
        ".dr-task--checked &": {
          borderColor: "transparent",
          "&:before": {
            transform: "scale(1)",
            opacity: "0",
            transition: "all 0.3s ease",
          },
          "&:after": {
            transform: "scale(1)",
            opacity: "0",
            transition: "all 0.6s ease",
          }
        }
      }}
    >
      <svg 
        viewBox="0 0 14 12"
        css={{
          position: "relative",
          width: "calc(7/8 * 1em)",
          height: "calc(3/4 * 1em)",
          top: "calc(-1/16 * 1em)",
          transform: "scale(0)",
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          ".dr-task--checked &": {
            transform: "scale(1)",
            transition: "all 0.4s ease",
            transitionDelay: "0.1s",
          }
        }}
      >
        <polyline 
          points="1 7.6 5 11 13 1"
          css={{
            strokeWidth: 2,
            stroke: "var(--color-accent-1)"
          }}
        />
      </svg>
    </span>
  )
}