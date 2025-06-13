/** @jsxImportSource @emotion/react */
import { RoutineGroup, routineGroupRepository } from '@/entities/routine-group';
import { useRoutineTree } from '@/features/note';
import { RoutineLikeNameValidator } from '@/features/routine-like';
import { createModal, useModal } from '@/shared/components/modal';
import { Modal } from '@/shared/components/modal/styled-modal';
import { TextEditComponent } from '@/shared/components/TextEditComponent';
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from 'react-hook-form';
import { CreateRoutineGroupForm } from '../model/create-routine-group-from';
import { getBaseRoutineGroup } from '../model/get-base-routine-group';


export const openCreateRoutineGroupModal = createModal(() => {
  const { ripple } = useRoutineTree();
  const modal = useModal();
  const baseRoutineGroupRef = useRef(getBaseRoutineGroup());
  const baseRoutineGroup = baseRoutineGroupRef.current;
  const {
    reset,
    control,
    handleSubmit,
    formState: { isValid },
    getFieldState
  } = useForm<CreateRoutineGroupForm>({
    defaultValues: {
      name: baseRoutineGroup.name,
    },
    mode: "onChange"
  });

  const routineNameValidator = useRef<RoutineLikeNameValidator | null>(null);
  useEffect(() => {
    if (routineNameValidator.current) {
      return;
    }
    const initializeValidator = async () => {
      const groups = await routineGroupRepository.loadAll();
      const validator = new RoutineLikeNameValidator(groups.map(r => r.name), null);
      routineNameValidator.current = validator;
    }
    initializeValidator();
  }, []);

  const handleSave = useCallback(async (form: CreateRoutineGroupForm) => {
    const newRoutineGroup: RoutineGroup = {
      ...baseRoutineGroup,
      name: form.name,
    }
    await routineGroupRepository.persist(newRoutineGroup);
    await ripple();
    reset();
    modal.close();
  }, [baseRoutineGroup, modal, reset, ripple]);

  return (
    <Modal header="Create Routine">

      {/* name */}
      <Modal.Section>
        <Modal.Header name='Name' />
        <Controller
          name='name'
          control={control}
          rules={{
            validate: (name) => {
              return routineNameValidator.current?.validate(name)
            }
          }}
          render={({ field, fieldState }) => (
            <TextEditComponent
              placeholder="Routine Name"
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

      {/* save */}
      <Modal.SubmitButton
        name='Save'
        disabled={!(isValid)}
        onClick={handleSubmit(handleSave)}
      />
    </Modal>
  )
}, {
  sidebarLayout: true,
});