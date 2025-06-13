/** @jsxImportSource @emotion/react */
import { Task } from '@/entities/task';
import { DaySelector } from '@/shared/components/DaySelector';
import { createModal, useModal } from '@/shared/components/modal';
import { Modal } from '@/shared/components/modal/styled-modal';
import { Day } from '@/shared/period/day';
import { Month } from '@/shared/period/month';
import { Notice, Platform } from 'obsidian';
import { useCallback } from 'react';
import { useScheduleTask } from '../model/use-schedule-task';



type Props = {
  task: Task;
}
export const openScheduleTaskModal = createModal(({ task }: Props) => {
  const modal = useModal();
  const { scheduleTask } = useScheduleTask(task);

  const handleScheduleTask = useCallback(async (day: Day) => {
    await scheduleTask(day);
    new Notice(`Task "${task.name}" scheduled for ${day.format()}`);
    modal.close();
  }, [modal, scheduleTask, task]);

  return (
    <Modal header='Schedule Task'>
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
    </Modal >
  )
}, {
  sidebarLayout: true,
});