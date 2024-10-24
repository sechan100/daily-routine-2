/** @jsxImportSource @emotion/react */
import { Modal } from "obsidian";
import { FunctionComponent } from "react";
import { createRoot } from "react-dom/client";
import { plugin } from "shared/plugin-service-locator";
import { createStoreContext } from "shared/zustand/create-store-context";



interface ModalOpenModalOption {
  sidebarLayout?: boolean;
}
const openModal = (component: React.ReactNode, option?: ModalOpenModalOption) => {
  const modal = new Modal(plugin().app);

  // sidebar layout
  if(option?.sidebarLayout) modal.modalEl.addClass("mod-sidebar-layout");

  // React render
  const fragment = document.createDocumentFragment();
  const el = document.createElement('div');
  el.addClass("dr-modal-root");
  createRoot(el).render(
    <StoreProvider 
      data={modal} 
      onDataChange={(s, d) => {
        s.setState({modal: d});
      }}
    >
      { component}
    </StoreProvider>
  )
  fragment.appendChild(el);
  modal.setContent(fragment);

  // .modal-content style
  modal.contentEl.setCssStyles({
    display: "block",
  })

  // open
  modal.open()
}


export const modalComponent = <P,>(Component: FunctionComponent<P>, option?: ModalOpenModalOption) => {
  return (props: P) => {
    // @ts-ignore
    openModal(<Component {...props} />, option);
  }
}


interface UseModal {
  modal: Modal;
}

const { StoreProvider, useStoreHook }= createStoreContext<Modal, UseModal>((modal, set, get) => ({
  modal
}));

export const useModal = () => useStoreHook(store => store.modal);