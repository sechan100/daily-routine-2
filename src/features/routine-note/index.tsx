import { RoutineNote, routineNoteArchiver } from "entities/archive";
import React, { useEffect, useRef, useState } from "react";
import "./style.scss";
import { NoteView } from "./note";
import { DaysMenu } from "./days";
import { Day } from "libs/day";
import { UseRoutineNoteContext } from "./use-routine-note";


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
}
export const RoutineNoteView = () => {
  const [todayNote, setTodayNote] = useState<RoutineNote | null>(null);

  useEffect(() => {
    routineNoteArchiver.getRoutineNote(Day.now())
    .then(note => {
      setTodayNote(note);
    });
  }, []);
  if(!todayNote) return (<div>Loading...</div>);

  return (
    <UseRoutineNoteContext initialData={todayNote}>
      <DaysMenu />
      <NoteView />
    </UseRoutineNoteContext>
  );  
}