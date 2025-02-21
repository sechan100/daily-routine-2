/** @jsxImportSource @emotion/react */
import { isTask, isTaskGroup, NoteEntity } from '@entities/note';
import { useRoutineNote } from "@features/note";
import { renderTask, TaskDndContext } from '@features/task-el';
import { Icon } from '@shared/components/Icon';
import { MenuComponent } from "@shared/components/Menu";
import { dr } from "@shared/utils/daily-routine-bem";
import { useStartRoutineModal } from '@widgets/routine';
import { TaskGroupWidget, useCreateGroupModal } from '@widgets/task-group';
import { useAddTodoModal } from '@widgets/todo';
import { WeeksWidget } from "@widgets/weeks";
import { Menu, Notice } from "obsidian";
import { useCallback, useMemo } from "react";
import { NoteContext } from './NoteContext';
import { useRoutineMutationMerge } from '@features/merge-note';


const startRoutineIcon = "alarm-clock-plus";
const addTodoIcon = "square-check";

const bem = dr("note");


export const RoutineNoteContent = () => {
  const note = useRoutineNote(n=>n.note);
  const { mergeNotes } = useRoutineMutationMerge();

  const AddTodoModal = useAddTodoModal();
  const StartRoutineModal = useStartRoutineModal();
  const CreateGroupModal = useCreateGroupModal();
  
  const onNoteMenuShow = useCallback((m: Menu) => {
    // Start New Routine
    m.addItem(item => {
      item.setIcon(startRoutineIcon);
      item.setTitle("Start new routine");
      item.onClick(() => {
        StartRoutineModal.open({});
      });
    });

    // Add Todo
    m.addSeparator();
    m.addItem(item => {
      item.setIcon(addTodoIcon);
      item.setTitle("Add todo");
      item.onClick(() => {
        AddTodoModal.open({});
      });
    });

    // Add Group
    m.addSeparator();
    m.addItem(item => {
      item.setIcon("folder");
      item.setTitle("Add group");
      item.onClick(() => {
        CreateGroupModal.open({});
      });
    });

    // mergeNotes
    m.addSeparator();
    m.addItem(item => {
      item.setIcon("merge");
      item.setTitle("Merge notes");
      item.onClick(() => {
        mergeNotes();
        new Notice("All Notes Merged!");
      });
    });
    
  }, [AddTodoModal, CreateGroupModal, StartRoutineModal, mergeNotes]);

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
      <WeeksWidget className={bem("weeks")} />
      <header
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1em 0.7em",
          borderBottom: "1px solid var(--background-modifier-border)",
          // height: "4.5em",
        }} 
        className={bem("header")}
      >
        <span css={{
          fontWeight: "bold",
          fontSize: "1.2em",
        }}>
          {note.day.format() + " / " + note.day.dow}
        </span>
        <div css={{
          display: "flex",
          gap: "1.5em",
        }}>
          <Icon size='21px' icon={addTodoIcon} onClick={() => AddTodoModal.open({})} />
          <MenuComponent size='21px' onMenuShow={onNoteMenuShow} icon="menu" />
        </div>
      </header>
      <div
        className={bem("tasks")}
        css={{
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <TaskDndContext>
        {(() => {
          if(note.children.length === 0) {
            return (
              <div css={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "var(--text-muted)",
                fontSize: "1.2em",
              }}>
                No tasks.. Add some todos or routines 🤗
              </div>
            )
          }

          return note.children.map(el => {
            if(isTaskGroup(el)) {
              return (
                <TaskGroupWidget
                  key={`${el.elementType}-${el.name}`}
                  group={el} 
                />)
            } else if(isTask(el)) {
              return renderTask(el, null);
            } else {
              return null;
            }
          })
        })()}
        </TaskDndContext>
      </div>
      <AddTodoModal />
      <StartRoutineModal />
      <CreateGroupModal />
    </div>
  );  
}