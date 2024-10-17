/** @jsxImportSource @emotion/react */
import { routineManager } from 'entities/routine';
import { Routine, RoutineProperties } from 'entities/routine';
import { Modal, Notice, TextComponent } from "obsidian";
import { useCallback, useEffect, useRef, useState } from "react";
import { plugin } from "shared/plugin-service-locator";
import React from "react";
import { createRoot } from "react-dom/client";
import { DaysOption } from "./DaysOption";
import { createStore, StoreApi, useStore } from "zustand";
import { Button } from 'shared/components/Button';
import { text } from 'stream/consumers';



export const openRoutineOptionModal = (routine: Routine) => {
  new RoutineOptionModal(routine).open();
}


// routine option store
interface RoutineOptionStore {
  original: Routine;
  routine: Routine;
  renameRoutine: (newName: string) => void;
  setProperties: (props: RoutineProperties) => void;
  updateMutations: () => void;
}
const createRoutineOptionStore = (r: Routine): StoreApi<RoutineOptionStore> => createStore<RoutineOptionStore>((set, get) => ({

  original: r,

  routine: r,

  renameRoutine: (newName) => {
    set({
      routine: {
        ...get().routine, 
        name: newName
      }
    });
  },

  setProperties: (props) => {
    set({
      routine: {
        ...get().routine,
        properties: props
      }
    });
  },
  
  updateMutations: () => {
    const originalName = get().original.name;
    const routine = get().routine;

    // 이름 변경
    if(originalName !== routine.name && routine.name.trim() !== ""){
      routineManager.rename(originalName, routine.name);
    }

    routineManager.editProperties(originalName, routine.properties);
  }
}));



// Modal Component
class RoutineOptionModal extends Modal {
  #store: StoreApi<RoutineOptionStore>;

  constructor(routine: Routine) {
    super(plugin().app);

    // zustand store
    this.#store = createRoutineOptionStore(routine);

    // render react component
    const el = this.contentEl;
    createRoot(el).render(<RoutineOptionModalComponent modal={this} />);
  }

  get store() {
    return this.#store;
  }

  // 닫힐 때 저장
  override onClose(): void {
    this.#store.getState().updateMutations();
  }
}



interface RoutineOptionModalProps {
  modal: RoutineOptionModal;
}
const RoutineOptionModalComponent = React.memo(function RoutineOptionModalComponent({ modal }: RoutineOptionModalProps){
  // option store
  const { routine, renameRoutine, updateMutations, setProperties } = useStore(modal.store);

  // 이름 편집 모드 상태
  const [nameEditMode, setNameEditMode] = useState<"edit" | "idle">("idle");

  // 이름 편집 input ref
  const nameEditRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(routine.name);
  useEffect(() => {
    if(!nameEditRef.current) return;
    const textComp = new TextComponent(nameEditRef.current)
    .setValue(name)
    .onChange((value) => setName(value));
    textComp.inputEl.focus();

    // @ts-ignore
    const enterKeyDown = (e: KeyboardEvent) => { if(e.key === "Enter") onDoneNameEditDoneClick(e.currentTarget.value);};
    textComp.inputEl.addEventListener("keydown", enterKeyDown)
    return () => {
      textComp.inputEl.removeEventListener("keydown", enterKeyDown);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameEditMode]); // 한번만 렌더링 해야함
  
  // 편집 완료 버튼 클릭시
  const onDoneNameEditDoneClick = useCallback((newName: string) => {
    setNameEditMode("idle")
    renameRoutine(newName);
  }, [renameRoutine]);


  /**
   * 삭제 버튼 클릭시 confirm modal을 띄우고, 확인시 루틴을 삭제한다.
   */
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
              // 실제로 루틴 삭제
              routineManager.delete(routine.name);
              // 모달 닫고 알림 띄우기
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


  // 컴포넌트
  if(!routine) return <div>Loading...</div>
  return (
    <div className="dr-routine-option">
      {/* 헤더 */}
      <div className="dr-routine-option__header">

        {nameEditMode === "idle" && (<>
          <div>{routine.name}</div>
          <button onClick={() => setNameEditMode("edit")}>Edit</button>
        </>)}

        {nameEditMode === "edit" && (<>
          <div ref={nameEditRef} />
          <button onClick={()=>onDoneNameEditDoneClick(name)}>Done</button>
        </>)}

      </div>
        
      {/* 본문 */}
      <section>
        {/* daysOfWeek OR daysOfMonth */}
        <DaysOption properties={routine.properties} setProperties={setProperties} />
        {/* 삭제 */}
        <div className="dr-routine-option__section dr-routine-option-delete">
          <h6>Delete The Routine</h6>
          <Button variant='danger' onClick={onDeleteBtnClick}>Delete</Button>
        </div>
      </section>
    </div>
  )
});