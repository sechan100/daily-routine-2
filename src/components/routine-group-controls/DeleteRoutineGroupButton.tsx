import { deleteRoutineGroup } from "@/core/routine/delete-routine-group";
import { RoutineGroup } from "@/entities/types/routine-group";
import { useRoutineTree } from "@/service/use-routine-tree";
import { Button } from "@/shared/components/Button";
import { useModal } from "@/shared/components/modal/create-modal";
import { doFlagConfirm } from "@/shared/components/modal/flag-confirm-modal";
import { Notice } from "obsidian";
import { useCallback } from "react";




type Props = {
  group: RoutineGroup;
}
export const DeleteRoutineGroupButton = ({
  group,
}: Props) => {
  const { ripple } = useRoutineTree();
  const modal = useModal();

  const handleDelete = useCallback(async () => {
    const { confirm, flag } = await doFlagConfirm({
      title: "Delete routine group",
      confirmText: "Delete",
      description: `Are you sure you want to delete the routine group '${group.name}'`,
      confirmBtnVariant: "destructive",
      flagOption: {
        defaultValue: false,
        text: "Delete all tasks in this group",
      }
    })
    if (!confirm) return;
    await deleteRoutineGroup(group.name, flag);
    await ripple();
    new Notice(`Routine group '${group.name}' has been deleted.`);
    modal.close();
  }, [group.name, modal, ripple]);


  return (
    <>
      <Button
        variant='destructive'
        onClick={handleDelete}
      >
        Delete Routine Group
      </Button>
    </>
  )
}