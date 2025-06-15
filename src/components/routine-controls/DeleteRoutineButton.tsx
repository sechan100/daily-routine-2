import { useRoutineTree } from "@/domain/note/use-routine-tree";
import { routineRepository } from "@/entities/repository/routine-repository";
import { Routine } from "@/entities/types/routine";
import { Button } from "@/shared/components/Button";
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { useModal } from "@/shared/components/modal/create-modal";
import { Notice } from "obsidian";
import { useCallback } from "react";




type Props = {
  routine: Routine;
}
export const DeleteRoutineButton = ({
  routine,
}: Props) => {
  const { ripple } = useRoutineTree();
  const modal = useModal();

  const handleDelete = useCallback(async () => {
    const deletionConfirm = await doConfirm({
      title: "Delete routine",
      confirmText: "Delete",
      description: `Are you sure you want to delete the routine ${routine.name}?`,
      confirmBtnVariant: "destructive"
    })
    if (!deletionConfirm) return;
    await routineRepository.delete(routine.name);
    await ripple();
    new Notice(`Routine ${routine.name} has been deleted.`);
    modal.close();
  }, [modal, ripple, routine.name]);


  return (
    <>
      <Button
        variant='destructive'
        onClick={handleDelete}
      >
        Delete Routine
      </Button>
    </>
  )
}