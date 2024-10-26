/** @jsxImportSource @emotion/react */
// eslint-disable-next-line fsd-import/public-api-imports
import { persisteOrUpdateRoutineNote } from 'entities/note/archive';
import { RoutineNote as RoutineNoteEntity, routineNoteService, routineNoteArchiver, UseRoutineNoteProvider, useRoutineNote } from 'entities/note';
import { openStartNewRoutineModal } from "features/routine";
import { DaysNav } from "features/days";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Day } from "shared/day";
import { dr } from "shared/daily-routine-bem";
import { MenuComponent } from "shared/components/Menu";
import { Menu } from "obsidian";
import { FeatureNoteUpdateProvider } from "features/feature-note";
import { RoutineTask, TaskDndContext, TodoTask } from 'widgets/tasks';
import { openAddTodoModal as openAddTodoModalFeatures } from 'features/todo';
import { Icon } from 'shared/components/Icon';
import { Button } from 'shared/components/Button';


interface RoutineNoteProps {
  day: Day;
}
export const RoutineNote = ({ day }: RoutineNoteProps) => {
  const [ noteData, setNoteData ] = useState<{
    note: RoutineNoteEntity;
    isTransient: boolean;
  } | null>(null);


  useEffect(() => {
    // note가 존재하면 가지고오고, 없으면 생성하고 저장은 하지 않고 반환한다. 다만, 생성한 노트가 오늘 노트라면 저장까지 해준다.
    (async () => {
      let routineNote = await routineNoteArchiver.load(day);
      let isTransient = false;
      if(!routineNote){
        routineNote = await routineNoteService.create(day);
        if(day.isToday()){
          await persisteOrUpdateRoutineNote(routineNote);
          isTransient = false;
        } else {
          isTransient = true;
        }
      }
      
      setNoteData({
        note: routineNote,
        isTransient
      });
    })(); 
  }, [day]);

  
  
  if(!noteData) return (<div>Loading...</div>);
  return (
    <UseRoutineNoteProvider 
      data={noteData} 
      onDataChange={(s, d) => s.setState({
        note: d.note,
        isTransient: d.isTransient
      })}
    >
      <RoutineNotePage />
    </UseRoutineNoteProvider>
  );
}


const RoutineNotePage = () => {
  const { note, setNoteAndSave } = useRoutineNote();
  const percentage = useMemo(() => routineNoteService.getTaskCompletion(note).percentageRounded, [note]);

  const mainRef = useRef<HTMLDivElement>(null);

  const openAddTodoModal = useCallback(() => openAddTodoModalFeatures({
    note: note,
    onTodoAdded: (newNote) => {
      setNoteAndSave(newNote);
    }
  }), [note, setNoteAndSave]);
  
  const onNoteMenuShow = useCallback((m: Menu) => {
    // Start New Routine
    m.addItem(item => {
      item.setIcon("alarm-clock-plus");
      item.setTitle("Start New Routine");
      item.onClick(() => {
        openStartNewRoutineModal({});
      });
    });

    m.addSeparator();

    // Add Todo
    m.addItem(item => {
      item.setIcon("square-check-big");
      item.setTitle("Add Todo");
      item.onClick(() => {
        openAddTodoModal();
      });
    });
  }, [openAddTodoModal]);

  const bem = useMemo(() => dr("note"), []);
  return (
    <FeatureNoteUpdateProvider 
      css={{
        height: "100%",
      }} 
      className={bem()}
    >
      <DaysNav 
        currentDay={note.day} 
        currentDayPercentage={percentage} 
        resizeObserver={entry => {
          const navHeight = entry.contentRect.height;
          if(mainRef.current){
            mainRef.current.style.height = `calc(100% - ${navHeight}px)`;
          }
        }}
      />
      <div className={bem("main")} ref={mainRef} css={{
        "--header-height": "4.5em",
        "--header-padding-y": "0.3em",
      }}>
        <header
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--header-padding-y) 0.5em",
            height: "var(--header-height)",
          }} 
          className={bem("header")}
        >
          <h4 css={{display: "inline-block"}}>
            {note.day.getBaseFormat() + " / " + note.day.getDayOfWeek()}
          </h4>
          <div css={{ display: "flex", gap: "1.5em", alignContent: "center"}}>
            <Button 
              onClick={() => openAddTodoModal()}
              css={{
                display: "flex",
                gap: "0.5em",
                height: "fit-content",
                backgroundColor: "var(--color-primary) !important",
                border: "1px solid var(--color-base-40)",
                padding: "0.4em 0.5em",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--font-ui-smaller)",
                fontWeight: "var(--font-normal)",
              }}
            >
              <Icon accent icon='square-check-big' />
              <span>Add Todo</span>
            </Button>
            <MenuComponent onMenuShow={onNoteMenuShow} />
          </div>
        </header>
        <div 
          className={bem("tasks")}
          css={{
            height: "calc(100% - var(--header-height) - var(--header-padding-y) * 2)",
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
      </div>
    </FeatureNoteUpdateProvider>
  );  
}
