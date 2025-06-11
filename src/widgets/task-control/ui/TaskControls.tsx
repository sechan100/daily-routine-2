/** @jsxImportSource @emotion/react */
import { noteTaskUtils } from '@/entities/note';
import { Task, TaskProperties } from '@/entities/task';
import { TaskNameValidator } from '@/features/ task';
import { useNoteTasks } from '@/features/note';
import { createModal, useModal } from '@/shared/components/modal';
import { Modal } from '@/shared/components/modal/styled';
import { TextEditComponent } from '@/shared/components/TextEditComponent';
import { ToggleComponent } from '@/shared/components/ToggleComponent';
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from 'react-hook-form';
import { TaskForm } from '../model/task-from';
import { DeleteTaskButton } from './DeleteTaskButton';



type Props = {
  task: Task;
}
export const openTaskControlsModal = createModal(({ task }: Props) => {
  const { tasks, updateTasks } = useNoteTasks();
  const modal = useModal();
  const {
    reset,
    control,
    handleSubmit,
    formState: { isValid, isDirty },
    getFieldState
  } = useForm<TaskForm>({
    defaultValues: {
      name: task.name,
      showOnCalendar: task.properties.showOnCalendar,
    },
    mode: "onChange"
  });

  const taskNameValidator = useRef<TaskNameValidator | null>(null);
  useEffect(() => {
    if (taskNameValidator.current) {
      return;
    }
    const initializeValidator = async () => {
      const validator = new TaskNameValidator(tasks.map(r => r.name), task.name);
      taskNameValidator.current = validator;
    }
    initializeValidator();
  }, [task.name, tasks]);

  const handleSave = useCallback(async (form: TaskForm) => {
    // 속성 변경
    const newProperties: TaskProperties = {
      ...task.properties,
      showOnCalendar: form.showOnCalendar,
    }
    let newTasks: Task[];
    newTasks = noteTaskUtils.updateTaskProperties(tasks, task.name, newProperties);
    // 이름 변경
    const isNameDirty = getFieldState('name').isDirty;
    if (isNameDirty) {
      newTasks = noteTaskUtils.rename(newTasks, task.name, form.name);
    }
    await updateTasks(newTasks);
    reset();
    modal.close();
  }, [getFieldState, modal, reset, task.name, task.properties, tasks, updateTasks]);

  return (
    <Modal header='Task Controls'>

      {/* name */}
      <Modal.Section>
        <Modal.Header name='Name' />
        <Controller
          name='name'
          control={control}
          rules={{
            validate: (name) => {
              return taskNameValidator.current?.validate(name)
            }
          }}
          render={({ field, fieldState }) => (
            <TextEditComponent
              placeholder="Task Name"
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

      {/* delete */}
      <Modal.Section>
        <Modal.Header name='Delete' />
        <DeleteTaskButton task={task} />
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