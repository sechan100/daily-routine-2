import { RoutineTask as RoutineTaskEntity, Task, useRoutineNote } from "entities/note";
import { routineManager } from "entities/routine";
import { useRoutineOptionModal } from "features/routine";
import { AbstractTask } from "./ui/AbstractTask";
import React, { useCallback } from "react"
import { registerRoutineNotesSynchronize } from "entities/note-synchronize";


interface RoutineTaskProps {
  task: RoutineTaskEntity;
}
export const RoutineTask = React.memo(({ task }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();
  const { note, setNote } = useRoutineNote();


  const onOptionClick = useCallback(async () => {
    const routine = await routineManager.get(task.name);
    RoutineOptionModal.open({ routine });
  }, [RoutineOptionModal, task.name])


  const onTaskReorder = useCallback(async (tasks: Task[]) => {
    await routineManager.reorder(tasks.filter(t => t.type === "routine").map(r => r.name))

    registerRoutineNotesSynchronize(note => setNote(note), note.day);
  }, [note.day, setNote])

  
  return (
    <>
      <AbstractTask
        onTaskReorder={onTaskReorder}
        className="dr-routine-task"
        task={task}
        onOptionMenu={onOptionClick}
      />
      <RoutineOptionModal />
    </>
  )
});