/** @jsxImportSource @emotion/react */
import { useEffect, useRef } from "react";
import { Button } from "../Button";
import { Modal } from "obsidian";
import { plugin } from "@shared/plugin-service-locator";
import { createRoot } from "react-dom/client";




interface ConfirmModalOptions {
  description: string;
  onConfirm: () => void;
  confirmText: string;
  confirmBtnVariant?: "primary" | "destructive" | "accent";
  onCancel?: () => void;
  className?: string;
}

type WithModal<P> = P & { modal: Modal; }


const ConfirmModalContentComponent = (props: WithModal<ConfirmModalOptions>) => {
  const modal = props.modal;

  return (
    <div 
      className={props.className}
      css={{
        display: "flex",
        fontSize: "0.9em",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "1em 0",
      }}
    >
      <p>{props.description}</p>
      <div css={`
        & button {
          margin-left: 1em;
        }
      `}>
        <Button onClick={() => {
          modal.close()
        }}>Cancel</Button>
        <Button 
          variant={props.confirmBtnVariant} 
          onClick={() => {
            props.onConfirm();
            modal.onClose = () => {};
            modal.close();
          }}
        >
          {props.confirmText}
        </Button>
      </div>
    </div>
  )
}

const createConfirmModal = (Component: React.FC<WithModal<ConfirmModalOptions>>, options: ConfirmModalOptions) => {
  const modal = new Modal(plugin().app);

  // React render
  const fragment = document.createDocumentFragment();
  const el = document.createElement('div');
  el.addClass("dr-modal-root");
  createRoot(el).render(
    <Component {...options} modal={modal} />
  )
  fragment.appendChild(el);
  modal.setContent(fragment);

  // .modal-content style
  modal.contentEl.setCssStyles({
    display: "block",
  })

  modal.modalEl.setCssStyles({
    width: "calc(var(--dialog-width))"
  })

  modal.onClose = () => {
    options.onCancel?.();
  }

  return modal;
}


export const openConfirmModal = (options: ConfirmModalOptions) => {
  const modal = createConfirmModal(ConfirmModalContentComponent, options);
  modal.open();
}