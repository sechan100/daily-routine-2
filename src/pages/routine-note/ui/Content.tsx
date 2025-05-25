/** @jsxImportSource @emotion/react */
import { useRoutineMutationMerge } from '@/entities/merge-note';
import { isTask, isTaskGroup } from '@/entities/note';
import { Icon } from '@/shared/components/Icon';
import { MenuComponent } from "@/shared/components/Menu";
import { dr } from "@/shared/utils/daily-routine-bem";
import { WeeksWidget } from "@/widgets/weeks";
import { Menu, Notice } from "obsidian";
import { useCallback } from "react";
import { useRoutineNoteStore } from "../model/use-routine-note";
import { useCreateGroupModal } from './group/create-group';
import { TaskGroupElement } from './group/TaskGroupElement';
import { useStartRoutineModal } from './routine/start-routine';
import { TaskDndContext } from './task-base/dnd/dnd-context';
import { renderTask } from './task-base/ui/render-task-widget';
import { useAddTodoModal } from './todo/add-todo';


const startRoutineIcon = "alarm-clock-plus";
const addTodoIcon = "square-check";

const bem = dr("note");


export const Content = () => {
  const note = useRoutineNoteStore(n => n.note);
  const setNote = useRoutineNoteStore(n => n.setNote);
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
      <WeeksWidget note={note} onDayClick={setNote} className={bem("weeks")} />
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
            if (note.children.length === 0) {
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
              if (isTaskGroup(el)) {
                return (
                  <TaskGroupElement
                    key={`${el.elementType}-${el.name}`}
                    group={el}
                  />)
              } else if (isTask(el)) {
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