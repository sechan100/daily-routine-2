import { routineNoteArchiver } from "entities/archive";
import { routineManager } from "entities/routine";
import { RoutineNote, routineNoteService, RoutineTask as RoutineTaskEntity } from "entities/routine-note";
////////////////////////////
import React, { useCallback, useEffect, useRef, useState } from "react"
import clsx from "clsx";
import "./routine-task.scss";
import { set } from "lodash";


interface RoutineTaskProps {
  routineNote: RoutineNote;
  task: RoutineTaskEntity;
  onContextMenu: (e: React.MouseEvent) => void;
}
export const RoutineTask = ({ routineNote, task, onContextMenu }: RoutineTaskProps) => {
  const [checked, setChecked] = useState(task.checked);
  useEffect(() => {
    setChecked(task.checked)
  }, [task.checked])
  const [isPressed, setIsPressed] = useState(false);
  const pressTimeout = useRef<NodeJS.Timeout | null>(null);

  // 루틴 클릭시
  const onClick = useCallback((e: React.MouseEvent) => {
    // 먼저 클래스 toggle
    const cns = e.currentTarget.classList;
    cns.toggle('dr-routine-task--checked');
    const isChecked = cns.contains('dr-routine-task--checked');

    // 개별루틴 업데이트
    routineManager.updateAchievement({
      routineName: task.name,
      day: routineNote.day,
      checked: isChecked
    });

    // 루틴노트 업데이트
    routineNoteService.checkTask(routineNote, task.name, isChecked);
    routineNoteArchiver.save(routineNote);

    // 상태 업데이트
    setChecked(isChecked)
  }, [task.name, routineNote])

  return (
    <div
      className={clsx("dr-routine-task", {
        "dr-routine-task--pressed": isPressed,
        "dr-routine-task--checked": checked
      })}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onTouchStart={() => {pressTimeout.current = setTimeout(() => setIsPressed(true), 150)}}
      onTouchEnd={() => {
        if(pressTimeout.current) {
          clearTimeout(pressTimeout.current)
        }
        setIsPressed(false)
      }}
    >
      <div className="dr-routine-task__flex">
        {/* 체크박스 */}
        <span className="dr-routine-task__cbx">
          <svg viewBox="0 0 14 12">
            <polyline points="1 7.6 5 11 13 1"></polyline>
          </svg>
        </span>
        {/* 루틴 이름 */}
        <span className="dr-routine-task__name">{task.name}</span>
      </div>
    </div>
  )
}
