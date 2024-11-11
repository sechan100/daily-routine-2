import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'obsidian';
import { plugin } from 'shared/plugin-service-locator';
import { create } from 'zustand';



export type OpenModal<O> = (options: O) => void;
export type OmitModalProps<P> = Omit<P, 'modal'>;

export interface ModalFC<P> extends React.FC {
  open: OpenModal<OmitModalProps<P>>;
}

type ModalCreateOptions = {
  sidebarLayout?: boolean;
};

interface ModalStore<P> {
  modal: Modal | null;
  props: P | null;
  setModal: (modal: Modal) => void;
  clearModal: () => void;
}

export interface ModalApi {
  onClose: (cb: () => void) => void;
  closeWithoutOnClose: () => void;
  close: () => void;
  setTitle: (title: string) => void;
  modalEl: HTMLElement;
}

export type UseModal<P> = () => ModalFC<P>;


const createModalApi = (modal: Modal): ModalApi => {
  const originalOnClose = modal.onClose;

  return {
    onClose: (cb) => {
      modal.onClose = () => {
        cb();
        originalOnClose();
      }
    },
    closeWithoutOnClose: () => {
      modal.onClose = () => {};
      originalOnClose();
      modal.close();
    },
    close: () => {
      modal.close();
    },
    setTitle: (title) => {
      modal.setTitle(title);
    },
    modalEl: modal.contentEl,
  }
}

export const createModal = <P,>(ContentComponent: React.FC<P>, options: ModalCreateOptions): UseModal<P> => { return () => {
  const modalStore = useRef(create<ModalStore<P>>((set) => ({
    modal: null,
    props: null,
    setModal: (modal: Modal) => set({modal}),
    clearModal: () => {
      set({modal: null})
    },
  })));

  // Modal 오픈 함수
  const openModal = useCallback((props: P) => {
    if(modalStore.current.getState().modal) return;
    
    const modal = new Modal(plugin().app);
    // sidebar layout
    if(options?.sidebarLayout) modal.modalEl.addClass("mod-sidebar-layout");
    // 기본값은 flex
    modal.contentEl.setCssStyles({
      display: "block",
    })
    modal.open();
    modalStore.current.setState({
      modal,
      props
    });
  }, []);


  // Modal 컴포넌트
  const ModalComponent = useCallback<React.FC<OmitModalProps<P>>>(() => {
    const { modal, props, clearModal } = modalStore.current();
    const container = useMemo<HTMLElement | null>(() => modal?.contentEl??null, [modal]);

    useEffect(() => {
      if(!modal) return;
      modal.onClose = () => clearModal();
    }, [clearModal, modal]);

    if (!container || !modal || !props) return null;
    
    const modalProps = {
      ...props,
      modal: createModalApi(modal),
    }
    return ReactDOM.createPortal(
      <>
        <ContentComponent {...modalProps} />
      </>,
      container
    );
  }, [modalStore]);
  
  return useMemo(() => Object.assign(ModalComponent, { open: openModal }), [ModalComponent, openModal]);
}}