/** @jsxImportSource @emotion/react */
import { Button } from "../Button";
import { Modal } from "obsidian";
import { plugin } from "@shared/utils/plugin-service-locator";
import { createRoot } from "react-dom/client";
import { t } from "@shared/i18n";



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
          // onClose의 resolve(false)는 이미 resolve된 Promise에는 영향이 없다.
          resolve(true);
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
  const modalButtonContainer = createDiv();
  modalButtonContainer.addClass("modal-button-container");
  modal.modalEl.appendChild(modalButtonContainer);
  const buttonsRoot = createRoot(modalButtonContainer);
  buttonsRoot.render(
    <ConfirmModalButtons {...options} modal={modal} resolve={resolve} />
  )

  // modal content
  modal.contentEl.appendChild((() => {
    const p = createEl("p");
    p.setText(options.description);
    return p;
  })());
  
  modal.onClose = () => {
    resolve(false);
    // 닫힌 뒤에도 React root가 남아 누수되지 않도록 해제한다.
    buttonsRoot.unmount();
  };

  return modal;
}


export const doConfirm = async (options: ConfirmModalOptions): Promise<boolean> => {
  const confirm = new Promise<boolean>(resolve => {
    const modal = createConfirmModal(options, resolve);
    modal.open();
  });

  return confirm;
}