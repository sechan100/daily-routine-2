/** @jsxImportSource @emotion/react */
import { RoutineNote as RoutineNoteEntity, routineNoteService, routineNoteArchiver, UseRoutineNoteProvider, useRoutineNote } from '@entities/note';
import { useStartRoutineModal } from "@widgets/routine";
import { Weeks } from "@features/weeks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Day } from "@shared/day";
import { dr } from "@shared/daily-routine-bem";
import { MenuComponent } from "@shared/components/Menu";
import { Menu } from "obsidian";
import { RoutineTask, TaskDndContext, TodoTask } from '@widgets/task';
import { useAddTodoModal } from '@widgets/todo';
import { Icon } from '@shared/components/Icon';
import { Button } from '@shared/components/Button';


interface RoutineNoteProps {
  day: Day;
}
export const RoutineNote = ({ day }: RoutineNoteProps) => {
  const [ note, setNote ] = useState<RoutineNoteEntity | null>(null);


  useEffect(() => {
    // note가 존재하면 가지고오고, 없으면 생성하고 저장은 하지 않고 반환한다. 다만, 생성한 노트가 오늘 노트라면 저장까지 해준다.
    (async () => {
      let routineNote = await routineNoteArchiver.load(day);
      if(!routineNote){
        routineNote = await routineNoteService.create(day);
        if(day.isToday()){
          await routineNoteArchiver.persist(routineNote, false);
        }
      }
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
      <RoutineNotePage />
    </UseRoutineNoteProvider>
  );
}


const RoutineNotePage = () => {
  const { note } = useRoutineNote();
  const percentage = useMemo(() => routineNoteService.getTaskCompletion(note).percentageRounded, [note]);

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
      <Weeks
        className={bem("weeks")}
        currentDay={note.day}
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
          {note.day.getBaseFormat() + " / " + note.day.getDayOfWeek()}
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
              case "routine": return <RoutineTask key={task.name} task={task} />
              case "todo": return <TodoTask key={task.name} task={task} />
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
