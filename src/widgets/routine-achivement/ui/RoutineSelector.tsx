/** @jsxImportSource @emotion/react */

import { Button } from '@/shared/components/Button';
import { Month } from '@/shared/period/month';
import { useLeaf } from '@/shared/view/use-leaf';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useCallback, useState } from "react";
import { useRoutineSelector } from "../model/use-routine-selector";









type Props = {
  month: Month;
  className?: string;
  maxWidth?: number;
}
export const RoutineSelector = ({
  month,
  maxWidth,
  className
}: Props) => {
  const { currentRoutine, setCurrentRoutine, routineOptionsPerMonth } = useRoutineSelector();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { view } = useLeaf();


  const handleRoutineOptionClick = useCallback((routine: string) => {
    setCurrentRoutine(routine);
    // menu close
    setAnchorEl(null);
  }, [setCurrentRoutine]);


  return (
    <div>
      <Button
        css={{
          width: view.contentEl.clientWidth,
          maxWidth: maxWidth,
          height: "50px",
          border: "1px solid var(--color-base-30)",
        }}
        id="dr-routine-achivement_routine-selector"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        {currentRoutine !== "" ? currentRoutine : "Select Routine"}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        css={{
          ".MuiPaper-root": {
            width: view.contentEl.clientWidth,
            transform: "translateX(16px) !important",
            maxHeight: "500px",
          },
          "ul": {
            "li": {
              minHeight: "20px !important",
              borderTop: "1px solid var(--color-base-30)",
            },
          },
          "li:nth-child(1)": {
            borderTop: "none"
          }
        }}
      >
        {(() => {
          const options = routineOptionsPerMonth.get(month.format());
          if (!options || options.length === 0) return <MenuItem>no routines...</MenuItem>;

          return options.map(routine => (
            <MenuItem
              key={routine}
              onClick={() => handleRoutineOptionClick(routine)}
            >
              {routine}
            </MenuItem>
          ))
        })()}
      </Menu>
    </div>
  )
}