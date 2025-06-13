/** @jsxImportSource @emotion/react */
import { Task } from '@/entities/task';
import { TEXT_CSS } from '@/shared/colors/text-style';
import { Button } from '@/shared/components/Button';
import { DaySelector } from '@/shared/components/DaySelector';
import { createModal, useModal } from '@/shared/components/modal';
import { Modal } from '@/shared/components/modal/styled-modal';
import { Day } from '@/shared/period/day';
import { Month } from '@/shared/period/month';
import { Notice, Platform } from 'obsidian';
import { useCallback } from 'react';
import { useRescheduleTask } from '../model/use-reshcedule-task';



type Props = {
  task: Task;
}
export const openRescheduleTaskModal = createModal(({ task }: Props) => {
  const modal = useModal();
  const { rescheduleTask, deferTask } = useRescheduleTask(task);

  const handleScheduleTask = useCallback(async (day: Day) => {
    await rescheduleTask(day);
    new Notice(`Task "${task.name}" scheduled for ${day.format()}`);
    modal.close();
  }, [modal, rescheduleTask, task.name]);

  const handleDeferTask = useCallback(async () => {
    await deferTask();
    new Notice(`Task "${task.name}" deferred.`);
    modal.close();
  }, [deferTask, modal, task.name]);

  return (
    <Modal header='Schedule Task'>

      <Modal.Section>
        <div css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          justifyContent: "center",
        }}>
          <Modal.Header name='Defer Task' />
          <p css={TEXT_CSS.description}>
            This will remove the task from the current note and add it to the queue.
          </p>
        </div>
        <Button
          variant='accent'
          onClick={handleDeferTask}
        >
          Defer
        </Button>
      </Modal.Section>
      <Modal.Separator />

      <div>
        <Modal.Header
          name='Reschedule Task'
          align='left'
          sx={{
            margin: "16px 0",
          }}
        />
        <div
          css={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div css={{ width: Platform.isMobile ? "100%" : "70%", }}>
            <DaySelector
              month={Month.now()}
              tileHeight={Platform.isMobile ? 45 : 40}
              onTileClick={handleScheduleTask}
            />
          </div>
        </div>
      </div>
    </Modal >
  )
}, {
  sidebarLayout: true,
});