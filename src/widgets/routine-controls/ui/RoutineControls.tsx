/** @jsxImportSource @emotion/react */
import { Routine, RoutineProperties, routineRepository } from '@/entities/routine';
import { useRippleRoutines } from '@/features/note';
import { RoutineNameValidator } from '@/features/routine';
import { createModal, useModal } from '@/shared/components/modal';
import { Modal } from '@/shared/components/modal/styled';
import { TextEditComponent } from '@/shared/components/TextEditComponent';
import { ToggleComponent } from '@/shared/components/ToggleComponent';
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from 'react-hook-form';
import { RoutineForm } from '../model/routine-form';
import { ControlledRecurrenceUnitControl } from './ControlledRecurrenceUnitControl';
import { DeleteRoutineButton } from './DeleteRoutineButton';



type Props = {
  routine: Routine;
}
export const openRoutineControlsModal = createModal(({ routine }: Props) => {
  const { ripple } = useRippleRoutines();
  const modal = useModal();
  const {
    register,
    control,
    handleSubmit,
    resetField,
    formState: { isValid, isDirty },
    getFieldState
  } = useForm<RoutineForm>({
    defaultValues: {
      name: routine.name,
      recurrenceUnit: routine.properties.recurrenceUnit,
      daysOfWeek: routine.properties.daysOfWeek,
      daysOfMonth: routine.properties.daysOfMonth,
      showOnCalendar: routine.properties.showOnCalendar,
      enabled: routine.properties.enabled,
    },
    mode: "onChange"
  });

  const routineNameValidator = useRef<RoutineNameValidator | null>(null);
  useEffect(() => {
    if (routineNameValidator.current) {
      return;
    }
    const initializeValidator = async () => {
      const routines = await routineRepository.loadAll();
      const validator = new RoutineNameValidator(routines.map(r => r.name), routine.name);
      routineNameValidator.current = validator;
    }
    initializeValidator();
  }, [routine.name]);

  const handleSave = useCallback(async (form: RoutineForm) => {
    // 이름 변경
    const isNameDirty = getFieldState('name').isDirty;
    if (isNameDirty) {
      await routineRepository.rename(routine.name, form.name);
    }
    // 속성 변경
    const newProperties: RoutineProperties = {
      ...routine.properties,
      recurrenceUnit: form.recurrenceUnit,
      daysOfWeek: form.daysOfWeek,
      daysOfMonth: form.daysOfMonth,
      showOnCalendar: form.showOnCalendar,
      enabled: form.enabled,
    }
    await routineRepository.updateProperties(routine.name, newProperties);
    await ripple();
    modal.close();
  }, [getFieldState, modal, ripple, routine.name, routine.properties]);

  return (
    <Modal header='Routine Controls'>

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

      {/* enabled */}
      <Modal.Section>
        <Modal.Header name='Enabled' />
        <Controller
          name='enabled'
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

      {/* delete */}
      <Modal.Section>
        <Modal.Header name='Delete' />
        <DeleteRoutineButton
          routine={routine}
        />
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