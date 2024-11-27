/** @jsxImportSource @emotion/react */
import { NoteService, RoutineNote } from '@entities/note';
import { UseRoutineNoteProvider, resolveRoutineNote, useRoutineNote } from "@features/note";
import { TaskDndContext } from '@features/task';
import { MenuComponent } from "@shared/components/Menu";
import { dr } from "@shared/daily-routine-bem";
import { Day } from "@shared/period/day";
import { RoutineTaskWidget, useStartRoutineModal } from '@widgets/routine';
import { TodoTaskWidget, useAddTodoModal } from '@widgets/todo';
import { WeeksWidget } from "@widgets/weeks";
import { Menu } from "obsidian";
import { useCallback, useEffect, useMemo, useState } from "react";


interface RoutineNoteProps {
  day: Day;
}
const RoutineNotePageContext = ({ day }: RoutineNoteProps) => {
  const [ note, setNote ] = useState<RoutineNote | null>(null);

  useEffect(() => {
    (async () => {
      const routineNote = await resolveRoutineNote(day);
      setNote(routineNote);
    })(); 
  }, [day]);

  if(!note) return (<div>Loading...</div>);
  return (
    <UseRoutineNoteProvider 
      data={note} 
      onDataChange={(s, note) => s.setState({
        note: note
      })}
    >
      <PageComponent />
    </UseRoutineNoteProvider>
  );
}

const PageComponent = () => {
  const note = useRoutineNote(n=>n.note);
  const percentage = useMemo(() => NoteService.getTaskCompletion(note).percentageRounded, [note]);

  const AddTodoModal = useAddTodoModal();
  const StartRoutineModal = useStartRoutineModal();
  
  const onNoteMenuShow = useCallback((m: Menu) => {
    // Start New Routine
    m.addItem(item => {
      item.setIcon("alarm-clock-plus");
      item.setTitle("Start New Routine");
      item.onClick(() => {
        StartRoutineModal.open({});
      });
    });

    m.addSeparator();

    // Add Todo
    m.addItem(item => {
      item.setIcon("square-check-big");
      item.setTitle("Add Todo");
      item.onClick(() => {
        AddTodoModal.open({});
      });
    });
  }, [AddTodoModal, StartRoutineModal]);

  const bem = useMemo(() => dr("note"), []);
  return (
    <div 
      className={bem()}
      css={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <WeeksWidget
        className={bem("weeks")}
        day={note.day}
        currentDayPercentage={percentage}
      />
      <header
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5em 1em",
          // height: "4.5em",
        }} 
        className={bem("header")}
      >
        <span css={{
          fontWeight: "bold",
          fontSize: "1.2em",
        }}>
          {note.day.format() + " / " + note.day.getDow()}
        </span>
        <MenuComponent onMenuShow={onNoteMenuShow} icon="ellipsis" />
      </header>
      <div
        className={bem("tasks")}
        css={{
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <TaskDndContext>
          {note.tasks.map(task => {
            switch(task.type){
              case "routine": return <RoutineTaskWidget key={task.name} task={task} />
              case "todo": return <TodoTaskWidget key={task.name} task={task} />
              default: task as never;
            }
          })}
        </TaskDndContext>
      </div>
      <AddTodoModal />
      <StartRoutineModal />
    </div>
  );  
}


export const RoutineNotePage = RoutineNotePageContext;