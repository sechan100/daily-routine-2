/** @jsxImportSource @emotion/react */
import { Month } from "@shared/period/month";
import { NoteAchievementWidget } from "@widgets/note-achievement";
import TabNavItem from '@mui/material/Tab';
import TabNav from '@mui/material/Tabs';
import { useState } from "react";
import { useLeaf } from "@shared/view/use-leaf";
import { css } from "@emotion/react";
import { Icon } from "@shared/components/Icon";
import { RoutineAchievementWidget } from "@widgets/routine-achievement";
import { useTabHeight } from "@app/ui/use-tab-height";
import { t } from "@shared/i18n";


type AchievementType = "note" | "routine";

// Note / Routine 하위 탭 높이(px, 위쪽 경계선 포함). 위젯 높이를 계산할 때 뺀다.
const SUB_TABS_HEIGHT = 50;
// 넓은 창에서 원이 지나치게 커지지 않도록 달력 너비를 제한한다.
const CONTENT_MAX_WIDTH = 420;

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  fontSize: "0.7em",
  height: `${SUB_TABS_HEIGHT - 1}px`,
  width: "50%",
})

export interface AchievementPageProps {
  month: Month;
}
export const AchievementPage = ({ month }: AchievementPageProps) => {
  const [type, setType] = useState<AchievementType>("note");
  const { leafBgColor } = useLeaf();
  const tabHeight = useTabHeight();
  const widgetHeight = Math.max(0, tabHeight - SUB_TABS_HEIGHT);

  return (
    <>
      <TabNav
        value={type}
        className="dr-tabs"
        scrollButtons={false}
        centered
        onChange={(_, value: AchievementType) => setType(value)}
        css={{
          zIndex: 5,
          boxSizing: "border-box",
          height: SUB_TABS_HEIGHT,
          borderTop: "1px solid var(--background-modifier-border)",
          backgroundColor: leafBgColor,
          minHeight: 0,
          width: "100%",
          "& .MuiTab-root": {
            color: "var(--text-muted)",
          },
          "& .MuiTab-root.Mui-selected": {
            color: "var(--text-accent)",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "var(--interactive-accent)",
          },
        }}
      >
        <TabNavItem
          label={t("stats.achievement.noteTab")}
          value={"note"} 
          icon={<Icon icon="notebook-pen" />} 
          iconPosition="start"
          css={tabCss}
        />
        <TabNavItem 
          label={t("stats.achievement.routineTab")}
          value={"routine"}
          icon={<Icon icon="alarm-clock-check" />}
          iconPosition="start"
          css={tabCss} 
        />
      </TabNav>
      <div css={{
        display: "flex",
        justifyContent: "center",
        padding: "0 8px",
      }}>
        <div css={{
          width: "100%",
          minWidth: 0,
          maxWidth: CONTENT_MAX_WIDTH,
        }}>
        {type === "note" ?
          <NoteAchievementWidget month={month} height={widgetHeight} />
          :
          <RoutineAchievementWidget month={month} height={widgetHeight} />
        }
        </div>
      </div>
    </>
  )
}
