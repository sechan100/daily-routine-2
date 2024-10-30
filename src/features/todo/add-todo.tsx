/**
 * routine note에 새로운 todo task를 추가하는 모달을 열어주는 함수를 정의한다.
 * 모달 내부적으로 새로운 todo task에 대한 입력을 받고, 이를 note에 추가해준다.
 */
/** @jsxImportSource @emotion/react */
import { routineNoteArchiver, routineNoteService, TodoTask, useRoutineNote } from "entities/note";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createModal, ModalApi } from "shared/components/modal/create-modal";
import { Modal } from "shared/components/modal/styled";
import { TextEditComponent } from "shared/components/TextEditComponent";
import { Button } from "shared/components/Button";
import { dr } from "shared/daily-routine-bem";



export const useAddTodoModal = createModal(({ modal }: { modal: ModalApi}) => {
  const { note, setNote } = useRoutineNote();

  const [ todo, setTodo ] = useState<TodoTask>({
    checked: false,
    name: "",
    type: "todo"
  });

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
      <Modal.Section>
        <Modal.Name>Name</Modal.Name>
        <TextEditComponent 
          value={todo.name} 
          placeholder="New Today Todo"
          onChange={(name) => setTodo({...todo, name})} 
        />
      </Modal.Section>
      <Modal.Separator />

      <Modal.Section>
        <Button
          width="100%"
          disabled={todo.name.trim() === ""}
          accent
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
