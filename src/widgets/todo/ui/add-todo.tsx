/** @jsxImportSource @emotion/react */
import { noteRepository, TaskEntity, TodoTask } from "@entities/note";
import { useRoutineNote } from "@features/note";
import { TaskOption } from "@features/task-el";
import { Button } from "@shared/components/Button";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/daily-routine-bem";
import { useCallback, useMemo, useState } from "react";


export const useAddTodoModal = createModal(({ modal }: { modal: ModalApi}) => {
  const { note, setNote } = useRoutineNote();
  const [ todo, setTodo ] = useState<TodoTask>(TaskEntity.createTodoTask(""));
  
  const onSave = useCallback(() => {
    const newNote = {
      ...note,
      children: [todo, ...note.children]
    }
    // NOTE: Todo 만들기는 거의 사용자가 원하는 동작임이 분명함으로, 노트가 없다면 강제로 생성해서 저장함. (confirm 띄우지 않음)
    noteRepository.save(newNote);
    setNote(newNote);
    modal.close();
  }, [modal, note, setNote, todo]);


  const bem = useMemo(() => dr("add-todo-modal"), []);
  return (
    <Modal className={bem()} header="Add New Todo" modal={modal}>
      <Modal.Separator edge />

      {/* name */}
      <TaskOption.Name
        value={todo.name}
        onChange={name => setTodo(todo => ({...todo, name}))}
        placeholder="New Todo"
        focus
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
