/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { calendarSkeletonCss } from "./BaseCalendar";


// 요약 행 높이(px). 아래 달력의 행 높이를 계산할 때 빼야 하므로 고정한다.
export const STAT_CHIPS_HEIGHT = 48;

export type Stat = {
  label: string;
  value: string;
  // 값이 어떻게 계산되는지. hover 시 툴팁(aria-label)으로 보인다.
  hint: string;
  accent?: boolean;
}

const ellipsisCss = css({
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  lineHeight: 1.25,
});

const chipCss = css({
  // 라벨 길이가 언어마다 달라(예: "Perfect days" / "모두 완료한 날") 같은 너비로 쪼개면 긴 라벨만 잘린다.
  // 내용 너비를 기준으로 남는 폭을 나눠 가지고, 모자랄 때만 줄어든다.
  flex: "1 1 auto",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 4px",
  border: "1px solid var(--background-modifier-border)",
  borderRadius: "var(--radius-s)",
});

const valueCss = css({
  fontSize: "var(--font-ui-small)",
  fontWeight: "var(--font-semibold)",
  color: "var(--text-normal)",
  fontVariantNumeric: "tabular-nums",
});

const labelCss = css({
  fontSize: "var(--font-ui-smaller)",
  color: "var(--text-muted)",
});


interface StatChipsProps {
  stats: Stat[];
  loading?: boolean;
  className?: string;
}
export const StatChips = ({ stats, loading = false, className }: StatChipsProps) => {
  return (
    <div
      className={className}
      css={{
        boxSizing: "border-box",
        display: "flex",
        gap: 6,
        height: STAT_CHIPS_HEIGHT,
        padding: "6px 0",
      }}
    >
      {stats.map(stat => (
        <div key={stat.label} css={chipCss} aria-label={stat.hint}>
          <span css={[
            ellipsisCss,
            valueCss,
            stat.accent && { color: "var(--text-accent)" },
            loading && calendarSkeletonCss,
          ]}>
            {loading ? "–" : stat.value}
          </span>
          <span css={[ellipsisCss, labelCss]}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}
