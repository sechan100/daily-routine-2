/** @jsxImportSource @emotion/react */
import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";
import { DEFAULT_ROUTINE, RoutineRepository, RoutineService } from "@entities/routine";
import { useRoutineNote } from "@features/note";
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { TaskOption } from '@features/task';
import { Button } from "@shared/components/Button";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useMemo, useReducer } from "react";



// 이어하기: 위의 default 설정할 때, default properties를 한 곳에서 정의할 필요가 있겠다. ex) entities의 types라던가 아니면 default-routine.ts 파일이라던가


interface StartRoutineModalProps {
  modal: ModalApi;
}
export const useStartRoutineModal = createModal(({ modal }: StartRoutineModalProps) => {
  const { note, setNote } = useRoutineNote();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, DEFAULT_ROUTINE());

  const onSaveBtnClick = useCallback(async () => {
    try {
      await RoutineRepository.persist(routine);
      new Notice(`Routine '${routine.name}' started! 🎉`);
      // precond: routineManager.create 함수가 루틴을 반드시 맨 앞 순서에 만든다고 가정
      setNote({
        ...note,
        tasks: [
          RoutineService.deriveRoutineToTask(routine),
          ...note.tasks
        ]
      })

      executeRoutineNotesSynchronize();
      modal.close();
    } catch(e) {
      new Notice(e.message);
    }
  }, [modal, note, routine, setNote]);


  const bem = useMemo(() => dr("start-new-routine"), []);
  return (
    <Modal header="Start New Routine" className={bem()} modal={modal}>
      <Modal.Separator edge />

      {/* name */}
      <TaskOption.Name
        value={routine.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
        placeholder="New Daily Routine"
      />
      <Modal.Separator />

      {/* active criteria */}
      <RoutineOption.ActiveCriteria 
        routine={routine} 
        setProperties={properties => dispatch({ type: "SET_PROPERTIES", payload: properties })} 
      />
      <Modal.Separator />

      {/* show on calendar */}
      {/* <TaskOption.ShowOnCalendar
        value={routine.properties.}
        onChange={(showOnCalendar) => setTodo({...todo, showOnCalendar})}
      /> */}

      {/* save */}
      <Modal.Section>
        <Button
          css={{ width: "100%" }}
          disabled={routine.name.trim() === ""}
          variant={routine.name.trim() === "" ? "disabled" : "accent"}
          onClick={onSaveBtnClick}
        >
          Save
        </Button>
      </Modal.Section>
    </Modal>
  )
}, {
  sidebarLayout: true,
});