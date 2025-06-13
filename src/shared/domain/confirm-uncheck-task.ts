import { doConfirm } from "../components/modal/confirm-modal"





export const confirmUncheckTask = async (): Promise<boolean> => {
  return await doConfirm({
    title: "Uncheck Task",
    description: "Are you sure you want to uncheck this task?",
    confirmText: "Uncheck",
    confirmBtnVariant: "accent",
  })
}