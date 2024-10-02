import { RoutineNote, routineNoteArchiver } from "entities/archive";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "./style.css";
import { NoteView } from "./note";
import { DaysMenu } from "./days";
import { Day } from "lib/day";
import { useRoutineNote, UseRoutineNoteContext } from "./use-routine-note";


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
}
export const RoutineNoteView = () => {
  const todayRoutineNoteRef = useRef<RoutineNote>({
    day: Day.now(),
    tasks: [],
  });

  useEffect(() => {
    routineNoteArchiver.getRoutineNote(Day.now())
    .then(note => {
      todayRoutineNoteRef.current = note;
    });
  }, []);

  return (
    <UseRoutineNoteContext initialData={todayRoutineNoteRef.current}>
      <DaysMenu />
      <NoteView />
    </UseRoutineNoteContext>
  );  
}