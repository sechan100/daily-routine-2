/** @jsxImportSource @emotion/react */
import { Month } from "@shared/period/month";
import { NoteAchivementWidget } from "@widgets/note-achivement";
import TabNavItem from '@mui/material/Tab';
import TabNav from '@mui/material/Tabs';
import { useState } from "react";
import { useLeaf } from "@shared/view/use-leaf";
import { css } from "@emotion/react";
import { Icon } from "@shared/components/Icon";
import { RoutineAchivementWidget } from "@widgets/routine-achivement";


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
  // FIXME: routine -> note로
  const [type, setType] = useState<AchivementType>("routine");
  const { view, leafBgColor } = useLeaf();

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
          <NoteAchivementWidget month={month} height={360} maxWidth={420} />
          :
          <RoutineAchivementWidget month={month} height={360} maxWidth={420} routineName={"🛏️ 이부자리 정리하기"} />
        }
        </div>
      </div>
    </>
  )
}