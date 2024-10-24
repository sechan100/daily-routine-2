/** @jsxImportSource @emotion/react */
import { useEffect } from "react";
import { Button } from "../Button";
import { modalComponent, useModal } from "./modal-component";




interface ConfirmModalProps {
  description: string;
  onConfirm: () => void;
  confirmText: string;
  confirmBtnVariant?: "primary" | "destructive" | "accent";
  onCancel?: () => void;
  className?: string;
}
const openModal = modalComponent(({ onCancel: cancel, onConfirm: confirm, confirmText, confirmBtnVariant, description, className }: ConfirmModalProps) => {
  const modal = useModal();
  useEffect(() => {
    modal.modalEl.setCssStyles({
      width: "calc(var(--dialog-width))"
    })
    modal.onClose = () => {
      cancel?.();

    }
  }, [cancel, modal, modal.modalEl]);

  return (
    <div 
      className={className}
      css={{
        display: "flex",
        fontSize: "0.9em",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "1em 0",
      }}
    >
      <p>{description}</p>
      <div css={`
        & button {
          margin-left: 1em;
        }
      `}>
        <Button onClick={() => {
          cancel?.();
          modal.close()
        }}>Cancel</Button>
        <Button variant={confirmBtnVariant} onClick={() => {
          confirm();
          modal.close();
        }}>{confirmText}</Button>
      </div>
    </div>
  )
}, {
  sidebarLayout: false,
});


export const openConfirmModal = (option: ConfirmModalProps) => openModal(option);