/** @jsxImportSource @emotion/react */
import { Icon } from '@shared/components/Icon';
import { t } from '@shared/i18n';
import { Month } from '@shared/period/month';
import { Menu } from 'obsidian';
import { useCallback, useMemo } from "react";
import { useRoutineSelector } from "../model/use-routine-selector";


// 선택 버튼 영역 높이(px). 아래 달력 높이를 계산할 때 뺀다.
export const ROUTINE_SELECTOR_HEIGHT = 48;


type Props = {
  month: Month;
  // 현재 루틴과 최근 노트에 기록된 루틴
  knownRoutines: string[];
}
export const RoutineSelector = ({
  month,
  knownRoutines,
}: Props) => {
  const { currentRoutine, setCurrentRoutine, routineOptionsPerMonth } = useRoutineSelector();

  // 보고 있는 달의 노트에만 남아 있는 오래된 루틴도 고를 수 있게 합친다.
  const options = useMemo(() => {
    const monthOptions = routineOptionsPerMonth.get(month.format()) ?? [];
    return Array.from(new Set([...knownRoutines, ...monthOptions]));
  }, [knownRoutines, month, routineOptionsPerMonth]);

  const openMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const menu = new Menu();
    if(options.length === 0){
      menu.addItem(item => item.setTitle(t("stats.routine.noneFound")).setDisabled(true));
    }
    options.forEach(routine => {
      menu.addItem(item => item
        .setTitle(routine)
        .setChecked(routine === currentRoutine)
        .onClick(() => setCurrentRoutine(routine))
      );
    });
    const rect = e.currentTarget.getBoundingClientRect();
    menu.showAtPosition({ x: rect.left, y: rect.bottom + 4, width: rect.width }, e.currentTarget.ownerDocument);
  }, [currentRoutine, options, setCurrentRoutine]);

  
  return (
    <div css={{
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      height: ROUTINE_SELECTOR_HEIGHT,
      paddingTop: 6,
    }}>
      <button
        aria-haspopup="menu"
        onClick={openMenu}
        css={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: 36,
          justifyContent: "space-between",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <span
          // 루틴 이름은 사용자가 쓴 것이라 아랍어·히브리어일 수 있다.
          dir="auto"
          css={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: currentRoutine !== "" ? "var(--text-normal)" : "var(--text-muted)",
          }}
        >
          {currentRoutine !== "" ? currentRoutine : t("stats.routine.select")}
        </span>
        <Icon icon="chevrons-up-down" color="var(--text-muted)" />
      </button>
    </div>
  )
}
