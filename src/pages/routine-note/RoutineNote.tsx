/* eslint-disable react-hooks/exhaustive-deps */
import { loadOrCreateRoutineNote } from "entities/utils";
import { RoutineNote as RoutineNoteEntity, routineNoteService } from "entities/routine-note";
import { openAddRoutineModal } from "features/routine";
import { DaysNav } from "features/days/DaysNav";
import { RoutineTask } from "features/routine";
/////////////////////
import { useCallback, useEffect, useRef, useState } from "react";
import { Day } from "shared/day";
import "./routine-note.scss";
import { useDaysNav } from "features/days";
import { TaskContext } from "features/task";


interface RoutineNoteProps {
  day: Day;
}

// 상태 연쇄: dayRef -> note(리렌더링)
export const RoutineNote = ({ day: propsDay }: RoutineNoteProps) => {
  // 노트 상태
  const [ note, setNote ] = useState<RoutineNoteEntity | null>(null);
  
  // day변수. day는 리렌더링을 트리거하지 않음. 리렌더링은 day의 파생상태인 note를 통해서 발생.
  const dayRef = useRef<Day>(propsDay);

  // daysNav에 현재 보고있는 note의 완료율을 동적으로 전달하기 위한 상태
  const updatePercentage = useDaysNav(state => state.updatePercentage);

  useEffect(() => { // props와 동기화
    setDayRef(propsDay);
  }, [propsDay]);

  // setDayRef
  const setDayRef = useCallback((_day: Day) => {
    dayRef.current = _day;
    // Day가 변경되면 해당하는 RoutineNote를 가져와서 설정
    loadOrCreateRoutineNote(_day)
    .then(note => {
      setNote(note);
    });
  }, [dayRef]);

  //////////////////////////////////////////
  // DaysNav에서 day 버튼 클릭시 콜백(day 변경)
  const onDayClick = useCallback((day: Day) => {
    setDayRef(day);
  }, [setDayRef]);

  ////////////////////////////////////////
  // routine 추가 버튼 콜백
  const onAddRoutineBtnClick = useCallback(() => {
    openAddRoutineModal();
  }, []);


  /**
   * task가 클릭되면 현재 note의 완료율이 변한다. 이를 DaysNav에 반영하기 위한 콜백
   */
  const onRoutineTaskClick = useCallback(() => {
    if(!note) return;
    const newPercentage = routineNoteService.getTaskCompletion(note).percentageRounded;
    updatePercentage({
      day: dayRef.current, 
      percentage: newPercentage
    });
  }, [note]);
  


  
  if(!note) return (<div>Loading...</div>);
  return (
    <div>
      <DaysNav currentDay={dayRef.current} onDayClick={onDayClick} />
      <div className="dr-note">
        <header className="dr-note__header">
          <div>
            <h1>{note.day.getBaseFormat()}</h1>
          </div>
          <button className="dr-note__add-routine" onClick={onAddRoutineBtnClick}>+ Routine</button>
        </header>
        <TaskContext routineNote={note}>
          {note.tasks.map((task, idx) => {
            return <RoutineTask key={idx} routineNote={note} routineTask={task} onTaskClick={onRoutineTaskClick} />
          })}
        </TaskContext>
      </div>
    </div>
  );  
}