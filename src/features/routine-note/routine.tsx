import React, { memo, useCallback, useEffect, useRef, useState } from "react"
import { RoutineTask } from "entities/archive";
import { DropdownComponent, Modal, Notice, TextComponent } from "obsidian";
import clsx from "clsx";
import { plugin } from "lib/plugin-service-locator";
import { createRoot } from "react-dom/client";
import { Routine, RoutineEditCmd, routineManager } from "entities/routine";
import { DAY_OF_WEEKS, DayOfWeek, dayOfWeekToString } from "lib/day";
import { create, createStore, StoreApi } from "zustand";
import { text } from "stream/consumers";



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





interface RoutineOptionStore {
  dayOfWeeks: Set<DayOfWeek>;
  addDayOfWeeks: (dayOfWeek: DayOfWeek) => void;
  removeDayOfWeeks: (dayOfWeek: DayOfWeek) => void;
  isDayOfWeeksEdited: boolean;
}
const createRoutineOptionStore = (routine: Routine) => createStore<RoutineOptionStore>((set, get) => ({
  dayOfWeeks: new Set(routine.properties.dayOfWeeks),
  addDayOfWeeks: (dayOfWeek) => {
    set(state => {
      state.dayOfWeeks.add(dayOfWeek);
      return {...state, isDayOfWeeksEdited: true}
    })
  },
  removeDayOfWeeks: (dayOfWeek) => {
    set(state => {
      state.dayOfWeeks.delete(dayOfWeek);
      return {...state, isDayOfWeeksEdited: true}
    })
  },
  isDayOfWeeksEdited: false,
}))


class RoutineOptionModal extends Modal {
  #routine: Routine;
  #store: StoreApi<RoutineOptionStore>;
  constructor(routine: Routine) {
    super(plugin().app);
    this.#routine = routine;
    this.#store = createRoutineOptionStore(routine);
    const el = document.createElement('div');
    createRoot(el).render(<RoutineOptionModalComponent routine={routine} store={this.#store} modal={this} />);
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
    if(this.#store.getState().isDayOfWeeksEdited){
      cmd.properties.dayOfWeeks = Array.from(this.#store.getState().dayOfWeeks).sort();
      isEdited = true;
    }

    // 저장
    if(isEdited) routineManager.edit(this.#routine.name, cmd);
  }
}

interface RoutineOptionModalProps {
  routine: Routine;
  store: StoreApi<RoutineOptionStore>;
  modal: RoutineOptionModal;
}
const RoutineOptionModalComponent = React.memo(function RoutineOptionModalComponent({ routine, store, modal }: RoutineOptionModalProps){
  // 이름 수정
  const nameEditElRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(routine.name);
  useEffect(() => {
    if(!nameEditElRef.current) return;
    const textComp = new TextComponent(nameEditElRef.current)
    .setValue(name)
    .onChange((value) => {
      setName(value);
    });
    textComp.inputEl.addEventListener('keydown', (e) => { if(e.key === 'Enter' && textComp.inputEl) editName()})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const editName = useCallback(() => {
    routineManager.edit(routine.name, {name});
    routine.name = name;
  }, [name, routine])


  // 날짜 하나하나 클릭시
  const onDayClick = useCallback((e: React.MouseEvent) => {
    e.currentTarget.classList.toggle("dr-routine-modal__day--active");
    const isActive = e.currentTarget.classList.contains("dr-routine-modal__day--active");
    const dayOfWeek = Number(e.currentTarget.getAttribute('data-day')) as DayOfWeek;
    if(isActive){
      store.getState().addDayOfWeeks(dayOfWeek);
    } else {
      store.getState().removeDayOfWeeks(dayOfWeek);
    }
  }, [store])


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
        <div className="dr-routine-modal__section dr-routine-modal__name">
          <h6>Rename</h6>
          <div ref={nameEditElRef} />
          <button onClick={editName}>Save</button>
        </div>

        {/* 요일 */}
        <div className="dr-routine-modal__section dr-routine-modal__days">
          <h6>Days</h6>
          <div className="dr-routine-modal__day-list">
            {DAY_OF_WEEKS.map((dayOfWeek, idx) => {
              const isActive = routine.properties.dayOfWeeks.contains(dayOfWeek);
              return (
                <button key={idx} data-day={dayOfWeek} onClick={onDayClick} className={clsx({"dr-routine-modal__day--active": isActive})}>
                  {dayOfWeekToString(dayOfWeek)}
                </button>
              )
            })}
          </div>
        </div>
        {/* 삭제 */}
        <div className="dr-routine-modal__section dr-routine-modal__delete">
          <h6>Delete The Routine</h6>
          <button onClick={onDeleteBtnClick}>Delete</button>
        </div>
      </section>
    </div>
  )
});