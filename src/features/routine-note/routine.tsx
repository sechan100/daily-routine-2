import React, { useCallback, useState } from "react"
import { RoutineTask } from "entities/archive";
import { Modal, Notice } from "obsidian";
import clsx from "clsx";
import { plugin } from "libs/plugin-service-locator";
import { createRoot } from "react-dom/client";
import { Routine, RoutineEditCmd, routineManager } from "entities/routine";
import { DayOfWeek } from "libs/day";
import { DaysOption, RenameOption } from "./routine-option";



interface Props {
  routine: RoutineTask;
  onCheckChange: (routine: RoutineTask, checked: boolean) => void;
}
export const RoutineComponent = ({ routine, onCheckChange }: Props) => {
  const [checked, setChecked] = useState(routine.checked);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimeout = React.useRef<NodeJS.Timeout | null>(null);
  
  const id = `routine-${routine.name}`

  const contextMenu = async (e: React.MouseEvent) => {
    const modal = new RoutineOptionModal(await routineManager.get(routine.name));
    modal.open();
  }

  return (
    <label 
      className={clsx("dr-routine", {"dr-routine--pressed": isPressed})}
      htmlFor={id}
      onContextMenu={contextMenu}
      onTouchStart={() => {pressTimeout.current = setTimeout(() => setIsPressed(true), 150)}}
      onTouchEnd={() => {
        if(pressTimeout.current) {
          clearTimeout(pressTimeout.current)
        }
        setIsPressed(false)
      }}
    >
      {/* 전체적으로 감싸주는 label */}
      <label htmlFor={id} className="dr-routine__item">
        {/* 체크박스(hidden) */}
        <input checked={checked} onChange={(e) => {
          onCheckChange(routine, e.target.checked)
          setChecked(e.target.checked)
        }} type="checkbox" id={id} className="hidden"/>
        {/* 체크박스(display) */}
        <label htmlFor={id} className="dr-routine__cbx">
          <svg viewBox="0 0 14 12">
            <polyline points="1 7.6 5 11 13 1"></polyline>
          </svg>
        </label>
        {/* 루틴 이름 */}
        <label htmlFor={id} className="dr-routine__name">{routine.name}</label>
      </label>
    </label>
  )
}




class RoutineOptionModal extends Modal {
  #routine: Routine;
  #daysSet: Set<DayOfWeek>;
  constructor(routine: Routine) {
    super(plugin().app);
    this.#routine = routine;
    this.#daysSet = new Set(routine.properties.dayOfWeeks);
    const el = document.createElement('div');
    createRoot(el).render(<RoutineOptionModalComponent routine={routine} daysSet={this.#daysSet} modal={this} />);
    const content = document.createDocumentFragment();
    content.appendChild(el);
    super.setContent(content);
  }

  // 닫힐 때 저장
  override onClose(): void {
    const cmd: RoutineEditCmd = {};
    let isEdited = false;

    // 프로퍼티 할당
    if(!cmd.properties) cmd.properties = {};
    // 요일 변경
    cmd.properties.dayOfWeeks = Array.from(this.#daysSet).sort();
    isEdited = true;

    // 저장
    if(isEdited) routineManager.edit(this.#routine.name, cmd);
  }
}

interface RoutineOptionModalProps {
  routine: Routine;
  daysSet: Set<DayOfWeek>;
  modal: RoutineOptionModal;
}
const RoutineOptionModalComponent = React.memo(function RoutineOptionModalComponent({ routine, daysSet, modal }: RoutineOptionModalProps){

  // 삭제 버튼 클릭시
  const onDeleteBtnClick = useCallback((e: React.MouseEvent) => {
    const confirmModal = new Modal(plugin().app);
    confirmModal.modalEl.addClass('dr-routine-delete-modal');
    const fragment = document.createDocumentFragment();
    fragment.append((()=>{
      const el = document.createElement('div');
      createRoot(el).render(
        <div className="dr-routine-delete-modal__content">
          <p>Are you sure you want to delete?</p>
          <div>
            <button className="dr-routine-delete-modal__cancel" onClick={() => confirmModal.close()}>Cancel</button>
            <button className="dr-routine-delete-modal__confirm" onClick={() => {
              routineManager.delete(routine.name);
              confirmModal.close();
              modal.close();
              new Notice(`Routine ${routine.name} deleted.`);
            }}>Delete</button>
          </div>
        </div>
      )
      return el;
    })());
    confirmModal.setContent(fragment).open()
  }, [modal, routine.name])



  if(!routine) return <div>Loading...</div>
  return (
    <div className="dr-routine-modal">
      {/* 헤더 */}
      <div className="dr-routine-modal__header">
        <h4>{routine.name}</h4>
      </div>
        
      {/* 본문 */}
      <section>
        {/* 이름 */}
        <RenameOption initialName={routine.name} onSave={(name) => {
          routineManager.edit(routine.name, {name: name});
          routine.name = name;
        }}/>
        {/* 요일 */}
        <DaysOption daysSet={daysSet} />
        {/* 삭제 */}
        <div className="dr-routine-modal__section dr-routine-modal__delete">
          <h6>Delete The Routine</h6>
          <button onClick={onDeleteBtnClick}>Delete</button>
        </div>
      </section>
    </div>
  )
});