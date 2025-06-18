/** @jsxImportSource @emotion/react */
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { STYLES } from "@/shared/styles/styles";
import { useAchivementMonthStore } from "@/stores/client/use-achivement-month-store";
import { css } from "@emotion/react";
import TabNavItem from '@mui/material/Tab';
import TabNav from '@mui/material/Tabs';
import { useState } from "react";
import { NoteAchivementWidget } from "./note-achivement/NoteAchivementWidget";
import { RoutineAchivementWidget } from "./routine-achivement/RoutineAchivementWidget";


type AchivementType = "note" | "routine";

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  fontSize: "0.7em",
  height: "50px",
  width: "50%",
})
export const AchivementPage = () => {
  const { month } = useAchivementMonthStore();
  const [type, setType] = useState<AchivementType>("note");

  return (
    <>
      <TabNav
        value={type}
        scrollButtons={false}
        centered
        sx={{ borderTop: 1, borderColor: 'divider' }}
        onChange={(e, value) => setType(value)}
        css={{
          zIndex: 5,
          backgroundColor: STYLES.palette.background,
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