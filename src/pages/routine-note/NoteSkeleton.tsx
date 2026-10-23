/** @jsxImportSource @emotion/react */
import { keyframes } from "@emotion/react";
import { t } from "@shared/i18n";
import { WEEKS_WIDGET_HEIGHT } from "@widgets/weeks";
import { NOTE_CONTENT_MAX_WIDTH, NOTE_HEADER_HEIGHT } from "./NoteHeader";


const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

const blockCss = {
  borderRadius: "var(--radius-s)",
  backgroundColor: "var(--background-modifier-hover)",
};

/**
 * 노트를 불러오는 데 오래 걸릴 때만 보이는 자리표시자.
 * 실제 화면(주간 바, 헤더, 목록)과 같은 높이를 차지해서, 내용이 들어올 때 레이아웃이 밀리지 않게 한다.
 */
export const NoteSkeleton = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("common.loading")}
      css={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: `${pulse} 1.6s ease-in-out infinite`,
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
      }}
    >
      <div css={{ height: WEEKS_WIDGET_HEIGHT, flexShrink: 0 }} />
      <div css={{
        flexShrink: 0,
        borderBottom: "1px solid var(--background-modifier-border)",
      }}>
        <div css={{
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
          height: NOTE_HEADER_HEIGHT,
          maxWidth: NOTE_CONTENT_MAX_WIDTH,
          margin: "0 auto",
          padding: "0 0.75em",
        }}>
          <div css={{ ...blockCss, width: "7em", height: "1.1em" }} />
        </div>
      </div>
      <div css={{
        width: "100%",
        maxWidth: NOTE_CONTENT_MAX_WIDTH,
        margin: "0 auto",
        padding: "0.75em",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "0.75em",
      }}>
        {["70%", "55%", "62%"].map((width, i) => (
          <div key={i} css={{ ...blockCss, width, height: "1em" }} />
        ))}
      </div>
    </div>
  )
}
