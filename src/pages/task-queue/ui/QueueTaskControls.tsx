/** @jsxImportSource @emotion/react */
import { Task, TaskProperties, taskUtils } from '@/entities/task';
import { TaskNameValidator } from '@/features/task';
import { DaySelector } from '@/shared/components/DaySelector';
import { createModal, useModal } from '@/shared/components/modal';
import { Modal } from '@/shared/components/modal/styled-modal';
import { TextEditComponent } from '@/shared/components/TextEditComponent';
import { ToggleComponent } from '@/shared/components/ToggleComponent';
import { Day } from '@/shared/period/day';
import { Month } from '@/shared/period/month';
import { Platform } from 'obsidian';
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from 'react-hook-form';
import { QueueTaskForm } from '../model/queue-task-from';
import { useTaskQueue } from '../model/use-task-queue';
import { DeleteQueueTaskButton } from './DeleteQueueTaskButton';



type Props = {
  task: Task;
}
export const openQueueTaskControls = createModal(({ task }: Props) => {
  const { queue, updateTasks, scheduleTask } = useTaskQueue();
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

  const handleScheduleTask = useCallback(async (day: Day) => {
    await scheduleTask(day, task);
    modal.close();
  }, [modal, scheduleTask, task]);

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
    await updateTasks(newTasks);
    reset();
    modal.close();
  }, [getFieldState, modal, queue.tasks, reset, task.name, task.properties, updateTasks]);

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

      <Modal.Section flexDirection='column'>
        <Modal.Header
          name='Schedule Task'
          align='left'
          sx={{
            marginBottom: "16px",
          }}
        />
        <div css={{
          width: Platform.isMobile ? "100%" : "70%",
        }}>
          <DaySelector
            month={Month.now()}
            tileHeight={Platform.isMobile ? 45 : 40}
            onTileClick={handleScheduleTask}
          />
        </div>
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