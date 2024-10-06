import { loadOrCreateRoutineNote } from "entities/utils";
import { RoutineNote } from "entities/routine-note";
/////////////////////
import { useEffect, useState } from "react";
import { NoteView } from "./note";
import { DaysMenu } from "./days";
import { Day } from "libs/day";
import { UseRoutineNoteContext } from "./use-routine-note";
import "./style.scss";


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  day?: Day; // 원하는 날짜의 routineNote 초기값을 원할 때 사용
}
export const RoutineNoteView = ({ day }: Props) => {
  const [todayNote, setTodayNote] = useState<RoutineNote | null>(null);

  useEffect(() => {
    loadOrCreateRoutineNote(day??Day.now())
    .then(note => {
      setTodayNote(note);
    });
  }, [day]);
  if(!todayNote) return (<div>Loading...</div>);

  return (
    <UseRoutineNoteContext initialData={todayNote}>
      <DaysMenu />
      <NoteView />
    </UseRoutineNoteContext>
  );  
}
