/** @jsxImportSource @emotion/react */
import { noteService, RoutineNote, Task } from "@/entities/note";
import { createModal, ModalApi } from "@/shared/components/modal/create-modal";
import { Modal } from "@/shared/components/modal/styled";
import { dr } from "@/shared/utils/daily-routine-bem";
import { useCallback, useMemo, useState } from "react";
import { useRoutineNoteStore, useRoutineNoteStoreActions } from "../../model/use-routine-note";


export const useAddTodoModal = createModal(({ modal }: { modal: ModalApi }) => {
  const note = useRoutineNoteStore(s => s.note);
  const { setNote } = useRoutineNoteStoreActions();
  const [task, setTask] = useState<Task>({
    name: "",
    properties: {
      showOnCalendar: true,
    },
    state: "un-checked",
  });

  const onSaveBtnClick = useCallback(() => {
    const newNote: RoutineNote = {
      ...note,
      tasks: [task, ...note.tasks],
    };
    // NOTE: Todo 만들기는 거의 사용자가 원하는 동작임이 분명함으로, 노트가 없다면 강제로 생성해서 저장함. (confirm 띄우지 않음)
    noteService.save(newNote);
    setNote(newNote);
    modal.close();
  }, [modal, note, setNote, task]);


  const bem = useMemo(() => dr("add-todo-modal"), []);
  return (
    <Modal className={bem()} header="Add new todo" modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        value={task.name}
        onChange={name => setTask(todo => ({ ...todo, name }))}
        placeholder="New todo"
        focus
      />
      <Modal.Separator />

      {/* show on calendar */}
      <Modal.ToggleSection
        name="Show on calendar"
        value={task.properties.showOnCalendar}
        onChange={showOnCalendar => setTask(todo => ({ ...todo, showOnCalendar }))}
      />
      <Modal.Separator edgeWithtransparent />

      {/* save */}
      <Modal.SaveBtn
        disabled={task.name.trim() === ""}
        onSaveBtnClick={onSaveBtnClick}
      />
    </Modal>
  );
}, {
  sidebarLayout: true,
})
