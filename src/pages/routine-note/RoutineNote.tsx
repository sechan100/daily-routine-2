/** @jsxImportSource @emotion/react */
/* eslint-disable react-hooks/exhaustive-deps */
import { loadOrCreateRoutineNote } from "entities/utils";
import { RoutineNote as RoutineNoteEntity, routineNoteService } from "entities/routine-note";
import { openStartNewRoutineModal } from "features/routine";
import { DaysNav } from "features/days";
import { useDaysNav } from "features/days";
import { TaskList } from "widgets/tasks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Day } from "shared/day";
import { Button } from "shared/components/Button";
import { dr } from "shared/daily-routine-bem";
import { MenuComponent } from "shared/components/Menu";
import { Menu } from "obsidian";
import { FeatureNoteUpdateProvider } from "features/feature-note";



interface RoutineNoteProps {
  day: Day;
}

// 상태 연쇄: dayRef -> note(리렌더링)
export const RoutineNote = ({ day: propsDay }: RoutineNoteProps) => {
  // 노트 상태
  const [ note, setNote ] = useState<RoutineNoteEntity | null>(null);
  
  // note의 파생상태인 day.
  const day = useMemo<Day>(() => {
    if(!note) return Day.now();
    return note.day;
  }, [note]);

  // setNoteBasedOnDay로 day를 기준으로 note 상태를 변경할 수 있다.
  const setNoteBasedOnDay = useCallback((_day: Day) => {
    // Day가 변경되면 해당하는 RoutineNote를 가져와서 설정
    loadOrCreateRoutineNote(_day)
    .then(note => {
      setNote(note);
    });
  }, [day]);

  // props로 넘겨진 day를 기준으로 note를 동기화
  useEffect(() => {
    setNoteBasedOnDay(propsDay);
  }, [propsDay]);


  /////////////////////////////////////////////////////////////////////////
  // daysNav에 현재 보고있는 note의 완료율을 동적으로 전달하기 위한 상태
  const updatePercentage = useDaysNav(state => state.updatePercentage);


  //////////////////////////////////////////
  // DaysNav에서 day 버튼 클릭시 콜백(day 변경)
  const onDayClick = useCallback((day: Day) => {
    setNoteBasedOnDay(day);
  }, [setNoteBasedOnDay]);

  ////////////////////////////////////////
  // routine 추가 버튼 콜백
  const onAddRoutineBtnClick = useCallback(() => {
    // openAddRoutineModal();
  }, []);


  /**
   * task가 클릭되면 현재 note의 완료율이 변한다. 이를 DaysNav에 반영하기 위한 콜백
   */
  const onRoutineTaskClick = useCallback(() => {
    if(!note) return;
    const newPercentage = routineNoteService.getTaskCompletion(note).percentageRounded;
    updatePercentage({
      day: day, 
      percentage: newPercentage
    });
  }, [note]);


  const onNoteMenuShow = useCallback((m: Menu) => {
    // Start New Routine
    m.addItem(item => {
      item.setIcon("alarm-clock-plus");
      item.setTitle("Start New Routine");
      item.onClick(() => {
        openStartNewRoutineModal();
      });
    });

    m.addSeparator();

    // Add Todo
    m.addItem(item => {
      item.setIcon("square-check-big");
      item.setTitle("Add Todo");
      item.onClick(() => {
        // openAddTodoModal();
      });
    });
  }, [note]);


  const bem = useMemo(() => dr("routine-note"), []);

  if(!note) return (<div>Loading...</div>);
  return (
    <FeatureNoteUpdateProvider className={bem()}>
      <DaysNav currentDay={day} onDayClick={onDayClick} />
      <main>
        <header 
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.3em 0.5em",
          }} 
          className={bem("header")}
        >
          <h4
            css={{
              display: "inline-block",
            }}
          >
            {note.day.getBaseFormat() + " / " + note.day.getDayOfWeek()}
          </h4>
          <MenuComponent onMenuShow={onNoteMenuShow} />
        </header>
        <TaskList 
          useRoutineNoteState={{state: note, setState: setNote}}
          onTaskClick={onRoutineTaskClick}
        />
      </main>
    </FeatureNoteUpdateProvider>
  );  
}