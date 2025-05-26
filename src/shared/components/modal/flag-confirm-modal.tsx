/** @jsxImportSource @emotion/react */
import { getPlugin } from "@/shared/utils/plugin-service-locator";
import { Modal } from "obsidian";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../Button";



type FlagConfirmModalOptions = {
  confirmText: string;
  title: string;
  description: string;

  flagOption: {
    defaultValue: boolean;
    text: string;
  }
  confirmBtnVariant?: "primary" | "destructive" | "accent";
  className?: string;
}

type FlagConfirm = {
  confirm: boolean;
  flag: boolean;
}

type ButtonsProps = Omit<FlagConfirmModalOptions, "title" & "description"> & {
  modal: Modal;
  resolve: ConfirmResolve;
  flag: {
    defaultValue: boolean;
    text: string;
  }
}

type ConfirmResolve = (value: FlagConfirm) => void;


const ConfirmModalButtons = ({
  confirmText,
  modal,
  confirmBtnVariant,
  resolve,
  flag: { defaultValue, text },
}: ButtonsProps) => {
  const [flag, setFlag] = useState(defaultValue);

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
      <label className="mod-checkbox">
        <input
          type="checkbox"
          checked={flag}
          onChange={e => setFlag(e.target.checked)}
        />
        {text}
      </label>
      <Button
        variant={confirmBtnVariant}
        onClick={() => {
          resolve({ confirm: true, flag });
          modal.onClose = () => { };
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

const createFlagConfirmModal = (options: FlagConfirmModalOptions, resolve: ConfirmResolve) => {
  const modal = new Modal(getPlugin().app);

  // modal container
  modal.containerEl.addClass("mod-confirmation");

  // modal
  modal.setTitle(options.title);
  if (options.className) modal.modalEl.addClass(options.className);
  modal.modalEl.setCssStyles({
    width: "calc(var(--dialog-width))"
  })

  // modal button container
  const modalButtonContainer = document.createElement("div");
  modalButtonContainer.addClass("modal-button-container");
  modal.modalEl.appendChild(modalButtonContainer);
  createRoot(modalButtonContainer).render(
    <ConfirmModalButtons {...options} modal={modal} resolve={resolve} flag={options.flagOption} />
  )

  // modal content
  modal.contentEl.appendChild((() => {
    const p = document.createElement("p");
    p.setText(options.description);
    return p;
  })());

  modal.onClose = () => resolve({
    confirm: false,
    flag: false,
  });

  return modal;
}

export const doFlagConfirm = async (options: FlagConfirmModalOptions): Promise<FlagConfirm> => {
  const confirm = new Promise<FlagConfirm>(resolve => {
    const modal = createFlagConfirmModal(options, resolve);
    modal.open();
  });

  return confirm;
}