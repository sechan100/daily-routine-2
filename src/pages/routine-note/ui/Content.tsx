/** @jsxImportSource @emotion/react */
import { Icon } from '@/shared/components/Icon';
import { MenuComponent } from "@/shared/components/Menu";
import { dr } from "@/shared/utils/daily-routine-bem";
import { NoteTasksWidget } from '@/widgets/note-tasks';
import { WeeksWidget } from "@/widgets/weeks";
import { Menu, Notice } from "obsidian";
import { useCallback } from "react";
import { useRoutineNoteStore, useRoutineNoteStoreActions } from "../model/use-routine-note";
import { useCreateGroupModal } from './group/create-group';
import { useStartRoutineModal } from './routine/start-routine';
import { useAddTodoModal } from './task/add-todo';


const startRoutineIcon = "alarm-clock-plus";
const addTodoIcon = "square-check";

const bem = dr("note");


export const Content = () => {
  const note = useRoutineNoteStore(n => n.note);
  const { setNote, merge } = useRoutineNoteStoreActions();

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
        merge();
        new Notice("All Notes Merged!");
      });
    });

  }, [AddTodoModal, CreateGroupModal, StartRoutineModal, merge]);

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
      <NoteTasksWidget tasks={note.tasks} />
      <AddTodoModal />
      <StartRoutineModal />
      <CreateGroupModal />
    </div>
  );
}