/** @jsxImportSource @emotion/react */
import { Routine, routineRepository } from '@/entities/routine';
import { useRoutineTree } from '@/features/note';
import { RoutineLikeNameValidator } from '@/features/routine-like';
import { createModal, useModal } from '@/shared/components/modal';
import { Modal } from '@/shared/components/modal/styled';
import { TextEditComponent } from '@/shared/components/TextEditComponent';
import { ToggleComponent } from '@/shared/components/ToggleComponent';
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from 'react-hook-form';
import { CreateRoutineForm } from '../model/create-routine-form';
import { getbaseRoutine } from '../model/get-base-routine';
import { ControlledRecurrenceUnitControl } from './ControlledRecurrenceUnitControl';


export const openCreateRoutineModal = createModal(() => {
  const { ripple } = useRoutineTree();
  const modal = useModal();
  const baseRoutineRef = useRef(getbaseRoutine());
  const baseRoutine = baseRoutineRef.current;
  const {
    reset,
    control,
    handleSubmit,
    formState: { isValid },
    getFieldState
  } = useForm<CreateRoutineForm>({
    defaultValues: {
      name: baseRoutine.name,
      recurrenceUnit: baseRoutine.properties.recurrenceUnit,
      daysOfWeek: baseRoutine.properties.daysOfWeek,
      daysOfMonth: baseRoutine.properties.daysOfMonth,
      showOnCalendar: baseRoutine.properties.showOnCalendar,
    },
    mode: "onChange"
  });

  const routineNameValidator = useRef<RoutineLikeNameValidator | null>(null);
  useEffect(() => {
    if (routineNameValidator.current) {
      return;
    }
    const initializeValidator = async () => {
      const routines = await routineRepository.loadAll();
      const validator = new RoutineLikeNameValidator(routines.map(r => r.name), null);
      routineNameValidator.current = validator;
    }
    initializeValidator();
  }, []);

  const handleSave = useCallback(async (form: CreateRoutineForm) => {
    const newRoutine: Routine = {
      ...baseRoutine,
      name: form.name,
      properties: {
        ...baseRoutine.properties,
        recurrenceUnit: form.recurrenceUnit,
        daysOfWeek: form.daysOfWeek,
        daysOfMonth: form.daysOfMonth,
        showOnCalendar: form.showOnCalendar,
      },
    }
    await routineRepository.persist(newRoutine);
    await ripple();
    reset();
    modal.close();
  }, [baseRoutine, modal, reset, ripple]);

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

      {/* Recurrence Unit */}
      <Modal.Section flex={false}>
        <ControlledRecurrenceUnitControl control={control} />
      </Modal.Section>
      <Modal.Separator />

      {/* show on calendar */}
      <Modal.Section>
        <Modal.Header name='Show on Calendar' />
        <Controller
          name='showOnCalendar'
          control={control}
          render={({ field }) => (
            <ToggleComponent
              value={field.value}
              onChange={field.onChange}
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