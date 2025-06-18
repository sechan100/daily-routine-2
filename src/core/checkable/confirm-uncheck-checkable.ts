import { doConfirm } from "@/shared/components/modal/confirm-modal"




export const confirmUncheckCheckable = async (): Promise<boolean> => {
  return await doConfirm({
    title: "Uncheck Checkable",
    description: "Are you sure you want to uncheck this?",
    confirmText: "Uncheck",
    confirmBtnVariant: "accent",
  })
}
