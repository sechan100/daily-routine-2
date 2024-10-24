/** @jsxImportSource @emotion/react */
import { routineManager } from 'entities/routine';
import { Routine, RoutineProperties } from 'entities/routine';
import { Notice } from "obsidian";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { DaysOption } from "./DaysOption";
import { Button } from 'shared/components/Button';
import { TextEditComponent } from 'shared/components/TextEditComponent';
import { modalComponent, useModal } from 'shared/components/modal/modal-component';
import { dr } from 'shared/daily-routine-bem';
import { ActiveButton } from 'shared/components/ToggleButton';
import { drEvent } from 'shared/event';
import { openConfirmModal } from 'shared/components/modal/confirm-modal';
import { Modal } from 'shared/components/modal/styled';




interface RoutineOptionModalProps {
  routine: Routine;
}
export const openRoutineOptionModal = modalComponent(React.memo((props: RoutineOptionModalProps) => {
  // routine state
  const [ routine, setRoutine ] = useState<Routine>(props.routine);

  // original routine name: 변경 사항을 저장하기 위해서 기존 identifier가 필요함
  const originalNameRef = useRef(props.routine.name);  

  // modal
  const modal = useModal();
  // modal이 닫힐 때 저장
  useEffect(() => {
    modal.onClose = () => {
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
    }
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
      // 삭제되었기 때문에 modal이 닫을 때 저장하는 로직을 초기화하고 닫음.
      modal.onClose = () => {};
      modal.close();
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


  // 컴포넌트
  if(!routine) return <div>Loading...</div>
  return (
    <Modal header='Routine Option'>
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
}), {
  sidebarLayout: true,
});