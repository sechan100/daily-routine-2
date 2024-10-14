import { Routine, routineManager, RoutineProperties } from "entities/routine";
import { DayOfWeek } from "shared/day";
import { Modal, Notice, TextComponent } from "obsidian";
import { useCallback, useEffect, useRef, useState } from "react";
import { plugin } from "shared/plugin-service-locator";
import React from "react";
import { createRoot } from "react-dom/client";
import { DaysOption } from "./DaysOption";
import { createStore, StoreApi, useStore } from "zustand";



export const openRoutineOptionModal = (routine: Routine) => {
  new RoutineOptionModal(routine).open();
}


interface RoutineOptionStore {
  routine: Routine;
  properties: RoutineProperties;
  updateProperties: (props: RoutineProperties) => void;
}

class RoutineOptionModal extends Modal {
  #store: StoreApi<RoutineOptionStore>;

  constructor(routine: Routine) {
    super(plugin().app);
    this.#store = createStore<RoutineOptionStore>((set) => ({
      routine: routine,
      properties: routine.properties,
      updateProperties: (props) => set({properties: props})
    }));
    const el = this.contentEl;
    createRoot(el).render(<RoutineOptionModalComponent modal={this} />);
  }

  get store() {
    return this.#store;
  }

  // 닫힐 때 저장
  override onClose(): void {
    const { routine, properties} = this.#store.getState();
    routineManager.editProperties(routine.name, properties);
  }
}



interface RoutineOptionModalProps {
  modal: RoutineOptionModal;
}
const RoutineOptionModalComponent = React.memo(function RoutineOptionModalComponent({ modal }: RoutineOptionModalProps){
  // Modal과 상태를 공유하기 위한 store
  const { properties, routine, updateProperties } = useStore(modal.store);

  
  ///////////////////////////////////////////////
  // 이름 수정
  const nameEditElRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(routine.name);
  // 이름 저장 콜백
  const onSaveRoutineName = useCallback(() => {
    routineManager.rename(routine.name, name);
  }, [name, routine.name]);
  // 이름 변경 input 컴포넌트
  useEffect(() => {
    if(!nameEditElRef.current) return;
    const textComp = new TextComponent(nameEditElRef.current)
    .setValue(name)
    .onChange((value) => setName(value))
    textComp.inputEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') onSaveRoutineName() });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])



  ////////////////////////////////////////////////
  // 삭제
  const onDeleteBtnClick = useCallback((e: React.MouseEvent) => {
    const confirmModal = new Modal(plugin().app);
    confirmModal.modalEl.addClass('dr-routine-option-delete-modal');
    const fragment = document.createDocumentFragment();
    fragment.append((()=>{
      const el = document.createElement('div');
      createRoot(el).render(
        <div className="dr-routine-option-delete-modal__content">
          <p>Are you sure you want to delete?</p>
          <div>
            <button className="dr-routine-option-delete-modal__cancel" onClick={() => confirmModal.close()}>Cancel</button>
            <button className="dr-routine-option-delete-modal__confirm" onClick={() => {
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


  ///////////////////////////////
  // 요일 변경
  const onDaysChange = useCallback((action: "add" | "remove", day: DayOfWeek) => {
    const days = properties.dayOfWeeks;
    if(action === "add"){
      updateProperties({
        ...properties,
        dayOfWeeks: [...days, day] 
      });
    } else {
      updateProperties({ 
        ...properties,
        dayOfWeeks: days.filter(d => d !== day) 
      });
    }
  }, [properties, updateProperties])


  ///////////////////////////
  // 컴포넌트
  if(!routine) return <div>Loading...</div>
  return (
    <div className="dr-routine-option">
      {/* 헤더 */}
      <div className="dr-routine-option__header">
        <h4>{routine.name}</h4>
      </div>
        
      {/* 본문 */}
      <section>
        {/* 이름 */}
        <div className="dr-routine-option__section dr-routine-option-name">
          <h6>Name</h6>
          <div ref={nameEditElRef} />
          <button onClick={onSaveRoutineName}>Save</button>
        </div>
        {/* 요일 */}
        <DaysOption getDays={() => properties.dayOfWeeks} onDaysChange={onDaysChange}/>
        {/* 삭제 */}
        <div className="dr-routine-option__section dr-routine-option-delete">
          <h6>Delete The Routine</h6>
          <button onClick={onDeleteBtnClick}>Delete</button>
        </div>
      </section>
    </div>
  )
});