/** @jsxImportSource @emotion/react */
import { routineManager } from 'entities/routine';
import { Routine, RoutineProperties } from 'entities/routine';
import { Notice } from "obsidian";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { DaysOption } from "./DaysOption";
import { Button } from 'shared/components/Button';
import { TextEditComponent } from 'shared/components/TextEditComponent';
import { dr } from 'shared/daily-routine-bem';
import { ActiveButton } from 'shared/components/ToggleButton';
import { drEvent } from 'shared/event';
import { openConfirmModal } from 'shared/components/modal/confirm-modal';
import { Modal } from 'shared/components/modal/styled';
import { createModal, ModalApi } from 'shared/components/modal/create-modal';




interface RoutineOptionModalProps {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ routine: propsRoutine, modal}: RoutineOptionModalProps) => {
  // routine state
  const [ routine, setRoutine ] = useState<Routine>(propsRoutine);

  // original routine name: 변경 사항을 저장하기 위해서 기존 identifier가 필요함
  const originalNameRef = useRef(propsRoutine.name);  

  // modal이 닫힐 때 저장
  useEffect(() => {
    modal.onClose(() => {
      const originalName = originalNameRef.current;
      // 이름 변경
      if(originalName !== routine.name && routine.name.trim() !== ""){
        routineManager.rename(originalName, routine.name);
      }
      // properties 변경
      routineManager.editProperties(originalName, routine.properties);

      drEvent.emit("updateRoutineProperties", {
        name: routine.name,
        properties: routine.properties
      });
    })
  }, [modal, routine.name, routine.properties]);

  
  const onNameEditDone = useCallback((newName: string) => {
    setRoutine({
      ...routine,
      name: newName
    })
  }, [routine]);


  // setProperties
  const setProperties = useCallback((newProperties: RoutineProperties) => {
    setRoutine({
      ...routine,
      properties: newProperties
    });
  }, [routine]);


  // activeCriteria 변경 콜백
  const changeActiveCriteria = useCallback((criteria: "week" | "month") => {
    setProperties({
      ...routine.properties,
      activeCriteria: criteria
    });
  }, [routine.properties, setProperties]);


  // bem
  const bem = useMemo(() => dr("routine-option"), []);

  /**
   * 삭제 버튼 클릭시 confirm modal을 띄우고, 확인시 루틴을 삭제한다.
   */
  const onDeleteBtnClick = useCallback((e: React.MouseEvent) => {
    const onConfirm = () => {
      routineManager.delete(routine.name);
      drEvent.emit("deleteRoutine", {name: routine.name});
      modal.closeWithoutOnClose();
      new Notice(`Routine ${routine.name} deleted.`);
    }

    openConfirmModal({
      onConfirm,
      className: bem("delete-confirm-modal"),
      confirmText: "Delete",
      description: `Are you sure you want to delete '${routine.name}'?`,
      confirmBtnVariant: "destructive"
    })
  }, [bem, modal, routine])

  return (
    <Modal header='Routine Option' modal={modal}>
      {/* name */}
      <Modal.Section className={bem("name")}>
        <Modal.Name>Name</Modal.Name>
        <TextEditComponent
          value={routine.name}
          onBlur={onNameEditDone} 
        />
      </Modal.Section>
      <Modal.Separator />

      {/* activeCriteria */}
      <Modal.Section className={bem("criteria")} >
        <Modal.Name>Active Criteria</Modal.Name>
        <nav className={bem("criteria-nav")}>
          <ActiveButton
            css={{marginRight: "0.5em"}}
            active={routine.properties.activeCriteria === "week"} 
            onClick={() => changeActiveCriteria("week")}
          >Week
          </ActiveButton>
          <ActiveButton
            active={routine.properties.activeCriteria === "month"}
            onClick={() => changeActiveCriteria("month")}
          >Month
          </ActiveButton>
        </nav>
      </Modal.Section>
      <DaysOption
        criteria={routine.properties.activeCriteria}
        css={{
          padding: "1em 0"
        }}
        className={bem("days")} 
        properties={routine.properties} 
        setProperties={setProperties}
      />
      <Modal.Separator />

      {/* delete */}
      <Modal.Section className={bem("delete")}>
        <Modal.Name>Delete</Modal.Name>
        <Button variant='destructive' onClick={onDeleteBtnClick}>Delete</Button>
      </Modal.Section>
    </Modal>
  )
}, {
  sidebarLayout: true,
});