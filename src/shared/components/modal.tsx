/** @jsxImportSource @emotion/react */
import { Modal } from "obsidian";
import { FunctionComponent } from "react";
import { createRoot } from "react-dom/client";
import { plugin } from "shared/plugin-service-locator";
import { createStoreContext } from "shared/zustand/create-store-context";
import { Container } from "./Container";
import { textCss } from "./font";
import { css } from "@emotion/react";





const ModalContainer = ({children, headerTitle}: {children: React.ReactNode, headerTitle: string}) => {
  return (
    <Container 
      css={css`
        .is-phone & {
          padding: 0 1em;
        }
      `}
    >
      <header css={css`
        padding: 1em 0;
        .is-phone & {
          display: none;
        };
      `}>
        <div css={textCss.mediumBold}>{headerTitle}</div>
      </header>
      {children}
    </Container>
  )
}



interface ModalOpenModalOption {
  modalClassName?: string;
  title?: string;
  sidebarLayout?: boolean;
  disableModalContainer?: boolean;
}
const openModal = (component: React.ReactNode, option?: ModalOpenModalOption) => {
  const modal = new Modal(plugin().app);

  // className
  if(option?.modalClassName) modal.modalEl.addClass(option.modalClassName);

  // sidebar layout
  if(option?.sidebarLayout) modal.modalEl.addClass("mod-sidebar-layout");

  // React render
  const fragment = document.createDocumentFragment();
  const el = document.createElement('div');
  el.addClass("dr-modal-root");
  createRoot(el).render(
    <StoreProvider data={modal}>
      {option?.disableModalContainer? component : <ModalContainer headerTitle={option?.title??"Modal"}>{component}</ModalContainer>}
    </StoreProvider>
  )
  fragment.appendChild(el);
  modal.setContent(fragment);

  // .modal-content style
  modal.contentEl.setCssStyles({
    display: "block",
  })

  // header
  modal.setTitle(option?.title??" ");

  // open
  modal.open()
}


export const modalComponent = <P,>(Component: FunctionComponent<P>, option?: ModalOpenModalOption) => {
  return (props?: P) => {
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