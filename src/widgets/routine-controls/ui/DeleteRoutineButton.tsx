import { Routine, routineRepository } from "@/entities/routine";
import { useRippleRoutines } from "@/features/note";
import { Button } from "@/shared/components/Button";
import { useModal } from "@/shared/components/modal";
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { useCallback } from "react";




type Props = {
  routine: Routine;
}
export const DeleteRoutineButton = ({
  routine,
}: Props) => {
  const { ripple } = useRippleRoutines();
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