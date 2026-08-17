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


type AchievementType = "note" | "routine";

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  fontSize: "0.7em",
  height: "50px",
  width: "50%",
})

export interface AchievementPageProps {
  month: Month;
}
export const AchievementPage = ({ month }: AchievementPageProps) => {
  const [type, setType] = useState<AchievementType>("note");
  const { leafBgColor } = useLeaf();

  return (
    <>
      <TabNav
        value={type}
        className="dr-tabs"
        scrollButtons={false}
        centered
        sx={{ borderTop: 1, borderColor: 'divider' }}
        onChange={(e, value) => setType(value)}
        css={{
          zIndex: 5,
          backgroundColor: leafBgColor,
          minHeight: 0,
          width: "100%",
        }}
      >
        <TabNavItem
          label="Note"
          value={"note"} 
          icon={<Icon icon="notebook-pen" />} 
          iconPosition="start"
          css={tabCss}
        />
        <TabNavItem 
          label="Routine" 
          value={"routine"}
          icon={<Icon icon="alarm-clock-check" />}
          iconPosition="start"
          css={tabCss} 
        />
      </TabNav>
      <div css={{
        display: "flex",
        justifyContent: "center"
      }}>
        <div>
        {type === "note" ?
          <NoteAchievementWidget month={month} height={400} maxWidth={420} />
          :
          <RoutineAchievementWidget month={month} height={400} maxWidth={420} />
        }
        </div>
      </div>
    </>
  )
}