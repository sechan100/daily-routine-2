/** @jsxImportSource @emotion/react */
import { routineManager } from 'entities/routine';
import { Routine, RoutineProperties } from 'entities/routine';
import { Notice } from "obsidian";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { DaysOption } from "./DaysOption";
import { Button } from 'shared/components/Button';
import { TextEditComponent } from 'shared/components/TextEditComponent';
import { modalComponent, useModal } from 'shared/components/modal';
import { dr } from 'shared/daily-routine-bem';
import { Section } from 'shared/components/Section';
import styled from '@emotion/styled';
import { textCss } from 'shared/components/font';
import { ActiveButton } from 'shared/components/ToggleButton';
import { css } from '@emotion/react';
import { drEvent } from 'shared/event';


const Name = styled.div`
  ${textCss.medium}
`;
const Description = styled.div`
  ${textCss.description}
`;



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
    const onDelete = () => {
      // 삭제되었기 때문에 저장할 필요가 없고, 오히려 저장하려고하면 file을 찾을 수 없어서 에러가 발생함.
      modal.onClose = () => {};
      modal.close();
      new Notice(`Routine ${routine.name} deleted.`);
    }
    openDeleteConfirmModal({
      routine,
      onDelete,
      className: bem("delete-confirm-modal")
    });
  }, [bem, modal, routine])


  // 컴포넌트
  if(!routine) return <div>Loading...</div>
  return (
    <>
      {/* name */}
      <Section 
        className={bem("name")}
        css={css`
          .is-phone & {
            border-top: none;
          }
        `}
      >
        <Name>Name</Name>
        <TextEditComponent
          value={routine.name}
          onBlur={onNameEditDone} 
        />
      </Section>

      {/* activeCriteria */}
      <Section className={bem("criteria")} >
        <Name>Active Criteria</Name>
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
      </Section>
      <DaysOption
        criteria={routine.properties.activeCriteria}
        css={{
          padding: "1em 0"
        }}
        className={bem("days")} 
        properties={routine.properties} 
        setProperties={setProperties}
      />

      {/* delete */}
      <Section className={bem("delete")}>
        <Name>Delete</Name>
        <Button variant='destructive' onClick={onDeleteBtnClick}>Delete</Button>
      </Section>
    </>
  )
}), {
  sidebarLayout: true,
  title: "Routine Option"
});


interface DeleteConfirmModalProps {
  routine: Routine;
  onDelete: ()=>void;
  className?: string;
}
const openDeleteConfirmModal = modalComponent(({ routine, onDelete, className }: DeleteConfirmModalProps) => {
  const modal = useModal();
  useEffect(() => {
    modal.modalEl.setCssStyles({
      width: "calc(var(--dialog-width) * 0.8)"
    })
  }, [modal.modalEl]);

  return (
    <div 
      className={className}
      css={{
        display: "flex",
        fontSize: "0.8em",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "1em 0",
      }}
    >
      <p>Are you sure you want to delete?</p>
      <div css={`
        & button {
          margin-left: 1em;
          font-size: 0.8em;
        }
      `}>
        <Button onClick={() => modal.close()}>Cancel</Button>
        <Button variant='destructive' onClick={() => {
          routineManager.delete(routine.name);
          drEvent.emit("deleteRoutine", {name: routine.name});
          modal.close();
          onDelete();
        }}>Delete</Button>
      </div>
    </div>
  )
}, {
  title: "Delete Routine",
  sidebarLayout: false
});