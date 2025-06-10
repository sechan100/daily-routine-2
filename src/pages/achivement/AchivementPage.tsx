/** @jsxImportSource @emotion/react */
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { Month } from "@/shared/period/month";
import { useLeaf } from "@/shared/view/use-leaf";
import { NoteAchivementWidget } from "@/widgets/note-achivement";
import { RoutineAchivementWidget } from "@/widgets/routine-achivement";
import { css } from "@emotion/react";
import TabNavItem from '@mui/material/Tab';
import TabNav from '@mui/material/Tabs';
import { useState } from "react";


type AchivementType = "note" | "routine";

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  fontSize: "0.7em",
  height: "50px",
  width: "50%",
})

export interface AchivementPageProps {
  month: Month;
}
export const AchivementPage = ({ month }: AchivementPageProps) => {
  const [type, setType] = useState<AchivementType>("note");
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
          icon={<ObsidianIcon icon="notebook-pen" />}
          iconPosition="start"
          css={tabCss}
        />
        <TabNavItem
          label="Routine"
          value={"routine"}
          icon={<ObsidianIcon icon="alarm-clock-check" />}
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
            <NoteAchivementWidget month={month} height={400} maxWidth={420} />
            :
            <RoutineAchivementWidget month={month} height={400} maxWidth={420} />
          }
        </div>
      </div>
    </>
  )
}