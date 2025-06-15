/** @jsxImportSource @emotion/react */
import { TaskNameValidator } from '@/domain/task/task-name-validator';
import { taskUtils } from '@/domain/task/tasks-utils';
import { Task, TaskProperties } from '@/entities/types/task';
import { TaskQueue } from '@/entities/types/task-queue';
import { createModal, useModal } from '@/shared/components/modal/create-modal';
import { Modal } from '@/shared/components/modal/styled-modal';
import { TextEditComponent } from '@/shared/components/TextEditComponent';
import { ToggleComponent } from '@/shared/components/ToggleComponent';
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from 'react-hook-form';
import { DeleteQueueTaskButton } from './DeleteQueueTaskButton';
import { QueueTaskForm } from './queue-task-from';
import { useTaskQueue } from './use-task-queue';



type Props = {
  task: Task;
}
export const openQueueTaskControls = createModal(({ task }: Props) => {
  const { queue, updateQueue } = useTaskQueue();
  const modal = useModal();
  const {
    reset,
    control,
    handleSubmit,
    formState: { isValid, isDirty },
    getFieldState
  } = useForm<QueueTaskForm>({
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
      const validator = new TaskNameValidator(queue.tasks.map(r => r.name), task.name);
      taskNameValidator.current = validator;
    }
    initializeValidator();
  }, [task.name, task, queue.tasks]);


  const handleSave = useCallback(async (form: QueueTaskForm) => {
    // 속성 변경
    const newProperties: TaskProperties = {
      ...task.properties,
      showOnCalendar: form.showOnCalendar,
    }
    let newTasks: Task[];
    newTasks = taskUtils.updateTaskProperties(queue.tasks, task.name, newProperties);
    // 이름 변경
    const isNameDirty = getFieldState('name').isDirty;
    if (isNameDirty) {
      newTasks = taskUtils.rename(newTasks, task.name, form.name);
    }
    const newQueue: TaskQueue = {
      ...queue,
      tasks: newTasks,
    }
    await updateQueue(newQueue);
    reset();
    modal.close();
  }, [getFieldState, modal, queue, reset, task.name, task.properties, updateQueue]);

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
        <DeleteQueueTaskButton task={task} />
      </Modal.Section>

      {/* save */}
      <Modal.SubmitButton
        name='Save'
        disabled={!(isDirty && isValid)}
        onClick={handleSubmit(handleSave)}
      />
    </Modal >
  )
}, {
  sidebarLayout: true,
});