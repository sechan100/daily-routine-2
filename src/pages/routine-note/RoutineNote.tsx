/* eslint-disable react-hooks/exhaustive-deps */
import { loadOrCreateRoutineNote } from "entities/utils";
import { RoutineNote as RoutineNoteEntity } from "entities/routine-note";
import { openAddRoutineModal } from "features/routine-option";
import { DaysNav } from "features/days/DaysNav";
/////////////////////
import { useCallback, useEffect, useRef, useState } from "react";
import { Day } from "shared/day";
import { RoutineTaskWidget } from "./routine-task-widget";
import "./style.scss";


interface RoutineNoteProps {
  day: Day;
}

// 상태 연쇄: dayRef -> note(리렌더링)
export const RoutineNote = ({ day: propsDay }: RoutineNoteProps) => {
  // 노트 상태
  const [ note, setNote ] = useState<RoutineNoteEntity | null>(null);

  ///////////////////////////// 
  // day변수. day는 리렌더링을 트리거하지 않음. 리렌더링은 day의 파생상태인 note를 통해서 발생.
  const dayRef = useRef<Day>(propsDay);
  useEffect(() => { // props와 동기화
    setDay(propsDay);
  }, [propsDay]);

  // setDay
  const setDay = useCallback((_day: Day) => {
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
    setDay(day);
  }, [setDay]);

  ////////////////////////////////////////
  // routine 추가 버튼 콜백
  const onAddRoutineBtnClick = useCallback(() => {
    openAddRoutineModal();
  }, []);

  
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
        {note.tasks.map((task, idx) => {
          return <RoutineTaskWidget key={idx} routineNote={note} task={task} />
        })}
      </div>
    </div>
  );  
}