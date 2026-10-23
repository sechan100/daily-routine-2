/** @jsxImportSource @emotion/react */
import { useState } from "react";
import { Button } from "../Button";
import { Modal } from "obsidian";
import { plugin } from "@shared/utils/plugin-service-locator";
import { createRoot } from "react-dom/client";
import { t } from "@shared/i18n";



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
          // onClose의 resolve({ confirm: false })는 이미 resolve된 Promise에는 영향이 없다.
          resolve({ confirm: true, flag });
          modal.close();
        }}
      >
        {confirmText}
      </Button>
      <Button onClick={() => modal.close()}>
        {t("common.cancel")}
      </Button>
    </div>
  )
}

const createFlagConfirmModal = (options: FlagConfirmModalOptions, resolve: ConfirmResolve) => {
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
  const modalButtonContainer = createDiv();
  modalButtonContainer.addClass("modal-button-container");
  modal.modalEl.appendChild(modalButtonContainer);
  const buttonsRoot = createRoot(modalButtonContainer);
  buttonsRoot.render(
    <ConfirmModalButtons {...options} modal={modal} resolve={resolve} flag={options.flagOption} />
  )

  // modal content
  modal.contentEl.appendChild((() => {
    const p = createEl("p");
    p.setText(options.description);
    return p;
  })());
  
  modal.onClose = () => {
    resolve({
      confirm: false,
      flag: false,
    });
    // 닫힌 뒤에도 React root가 남아 누수되지 않도록 해제한다.
    buttonsRoot.unmount();
  };

  return modal;
}

export const doFlagConfirm = async (options: FlagConfirmModalOptions): Promise<FlagConfirm> => {
  const confirm = new Promise<FlagConfirm>(resolve => {
    const modal = createFlagConfirmModal(options, resolve);
    modal.open();
  });

  return confirm;
}