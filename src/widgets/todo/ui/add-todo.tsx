/** @jsxImportSource @emotion/react */
import { routineNoteArchiver, routineNoteService, TodoTask, useRoutineNote } from "@entities/note";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { Button } from "@shared/components/Button";
import { dr } from "@shared/daily-routine-bem";
import { TaskOption } from "@features/task";


const DEFAULT_TASK: TodoTask = {
  checked: false,
  name: "",
  type: "todo",
  showOnCalendar: true,
}

export const useAddTodoModal = createModal(({ modal }: { modal: ModalApi}) => {
  const { note, setNote } = useRoutineNote();
  const [ todo, setTodo ] = useState<TodoTask>(DEFAULT_TASK);
  
  const onSave = useCallback(() => {
    if(todo.name.trim() === "") return;
    const newNote = routineNoteService.addTodoTask(note, todo);
    setNote(newNote);
    routineNoteArchiver.save(newNote);
    modal.close();
  }, [todo, note, setNote, modal]);


  const bem = useMemo(() => dr("add-todo-modal"), []);
  return (
    <Modal className={bem()} header="Add New Todo" modal={modal}>
      <Modal.Separator edge />

      {/* name */}
      <TaskOption.Name
        value={todo.name}
        onChange={name => setTodo(todo => ({...todo, name}))}
        placeholder="New Today Todo"
      />
      <Modal.Separator />

      {/* show on calendar */}
      <TaskOption.ShowOnCalendar
        value={todo.showOnCalendar}
        onChange={showOnCalendar => setTodo(todo => ({...todo, showOnCalendar}))}
      />
      <Modal.Separator edge />

      {/* save */}
      <Modal.Section>
        <Button
          css={{ width: "100%" }}
          disabled={todo.name.trim() === ""}
          variant={todo.name.trim() === "" ? "disabled" : "accent"}
          onClick={onSave}
        >
          Save
        </Button>
      </Modal.Section>
    </Modal>
  );
}, {
  sidebarLayout: true,
})
