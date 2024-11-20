/** @jsxImportSource @emotion/react */
import { useEffect, useRef } from "react";
import { Button } from "../Button";
import { Modal } from "obsidian";
import { plugin } from "@shared/plugin-service-locator";
import { createRoot } from "react-dom/client";



interface ConfirmModalOptions {
  confirmText: string;
  title: string;
  description: string;
  
  confirmBtnVariant?: "primary" | "destructive" | "accent";
  className?: string;
}

type ButtonsProps = Omit<ConfirmModalOptions, "title" & "description"> & { 
  modal: Modal;
  resolve: ConfirmResolve;
}

type ConfirmResolve = (value: boolean) => void;


const ConfirmModalButtons = ({
  confirmText,
  modal,
  confirmBtnVariant,
  resolve,
}: ButtonsProps) => {

  return (
    <div 
      css={{
        display: "flex",
        fontSize: "0.9em",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1em",
        ".is-phone &": {
          flexDirection: "column",
          "button": {
            width: "100%",
          }
        },
      }}
    >
      <Button
        variant={confirmBtnVariant} 
        onClick={() => {
          resolve(true);
          modal.onClose = () => {};
          modal.close();
        }}
      >
        {confirmText}
      </Button>
      <Button onClick={() => modal.close()}>
        Cancel
      </Button>
    </div>
  )
}

const createConfirmModal = (options: ConfirmModalOptions, resolve: ConfirmResolve) => {
  const modal = new Modal(plugin().app);
  
  // modal container
  modal.containerEl.addClass("mod-confirmation");

  // modal
  modal.setTitle(options.title);
  if(options.className) modal.modalEl.addClass(options.className);
  modal.modalEl.setCssStyles({
    width: "calc(var(--dialog-width))"
  })

  // modal button container
  const modalButtonContainer = document.createElement("div");
  modalButtonContainer.addClass("modal-button-container");
  modal.modalEl.appendChild(modalButtonContainer);
  createRoot(modalButtonContainer).render(
    <ConfirmModalButtons {...options} modal={modal} resolve={resolve} />
  )

  // modal content
  modal.contentEl.appendChild((() => {
    const p = document.createElement("p");
    p.setText(options.description);
    return p;
  })());
  
  modal.onClose = () => resolve(false);

  return modal;
}


export const doConfirm = async (options: ConfirmModalOptions): Promise<boolean> => {
  const confirm = new Promise<boolean>(resolve => {
    const modal = createConfirmModal(options, resolve);
    modal.open();
  });

  return confirm;
}