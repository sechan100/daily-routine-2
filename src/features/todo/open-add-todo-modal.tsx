/**
 * routine note에 새로운 todo task를 추가하는 모달을 열어주는 함수를 정의한다.
 * 모달 내부적으로 새로운 todo task에 대한 입력을 받고, 이를 note에 추가해준다.
 */
/** @jsxImportSource @emotion/react */
import { RoutineNote, routineNoteService, TodoTask } from "entities/note";
import { useMemo, useState } from "react";
import { modalComponent, useModal } from "shared/components/modal/modal-component";
import { Modal } from "shared/components/modal/styled";
import { TextEditComponent } from "shared/components/TextEditComponent";
import { ActiveButton } from "shared/components/ToggleButton";
import { dr } from "shared/daily-routine-bem";



interface AddTodoModalProps {
  note: RoutineNote;
  onTodoAdded: (newTodoAddedNote: RoutineNote) => void;
}
export const openAddTodoModal = modalComponent(({ note, onTodoAdded }: AddTodoModalProps) => {
  const modal = useModal();

  const [ todo, setTodo ] = useState<TodoTask>({
    checked: false,
    name: "",
    type: "todo"
  });



  const bem = useMemo(() => dr("add-todo-modal"), []);
  return (
    <Modal className={bem()} header="Add New Todo">
      <Modal.Section>
        <Modal.Name>Name</Modal.Name>
        <TextEditComponent value={todo.name} onBlur={(name) => setTodo({...todo, name})} />
      </Modal.Section>
      <Modal.Separator />

      <Modal.Section>
        <ActiveButton
          active={true} 
          css={{
            width: "100%"
          }}
          onClick={() => {
            if(todo.name.trim() === "") return;
            const newNote = routineNoteService.addTodoTask(note, todo);
            onTodoAdded(newNote);
            modal.close();
          }}
        >
          Save
        </ActiveButton>
      </Modal.Section>
    </Modal>
  );
}, {
  sidebarLayout: true,
})
