/** @jsxImportSource @emotion/react */
import { RoutineGroup, routineGroupRepository } from '@/entities/routine-group';
import { useRoutineTree } from '@/features/note';
import { renameRoutineGroup, RoutineLikeNameValidator } from '@/features/routine-like';
import { createModal, useModal } from '@/shared/components/modal';
import { Modal } from '@/shared/components/modal/styled';
import { TextEditComponent } from '@/shared/components/TextEditComponent';
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from 'react-hook-form';
import { RoutineGroupForm } from '../model/routine-form';
import { DeleteRoutineGroupButton } from './DeleteRoutineGroupButton';



type Props = {
  group: RoutineGroup;
}
export const openRoutineGroupControlsModal = createModal(({ group }: Props) => {
  const { ripple } = useRoutineTree();
  const modal = useModal();
  const {
    reset,
    control,
    handleSubmit,
    formState: { isValid, isDirty },
    getFieldState,
  } = useForm<RoutineGroupForm>({
    defaultValues: {
      name: group.name,
    },
    mode: "onChange"
  });

  const nameValidator = useRef<RoutineLikeNameValidator | null>(null);
  useEffect(() => {
    if (nameValidator.current) {
      return;
    }
    const initializeValidator = async () => {
      const groups = await routineGroupRepository.loadAll();
      const validator = new RoutineLikeNameValidator(groups.map(r => r.name), group.name);
      nameValidator.current = validator;
    }
    initializeValidator();
  }, [group.name]);

  const handleSave = useCallback(async (form: RoutineGroupForm) => {
    // 이름 변경
    const isNameDirty = getFieldState('name').isDirty;
    if (isNameDirty) {
      await renameRoutineGroup(group.name, form.name);
    }
    await ripple();
    reset();
    modal.close();
  }, [getFieldState, group.name, modal, reset, ripple]);

  return (
    <Modal header='Routine Group Controls'>

      {/* name */}
      <Modal.Section>
        <Modal.Header name='Name' />
        <Controller
          name='name'
          control={control}
          rules={{
            validate: (name) => {
              return nameValidator.current?.validate(name)
            }
          }}
          render={({ field, fieldState }) => (
            <TextEditComponent
              placeholder="Routine Group Name"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </Modal.Section>
      <Modal.Separator />

      {/* delete */}
      <Modal.Section>
        <Modal.Header name='Delete' />
        <DeleteRoutineGroupButton group={group} />
      </Modal.Section>

      {/* save */}
      <Modal.SubmitButton
        name='Save'
        disabled={!(isDirty && isValid)}
        onClick={handleSubmit(handleSave)}
      />
    </Modal>
  )
}, {
  sidebarLayout: true,
});