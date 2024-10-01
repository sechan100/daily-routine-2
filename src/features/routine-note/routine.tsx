import React from "react"
import { RoutineTask } from "entities/archive";



interface Props {
  task: RoutineTask;
  onCheckChange: (routine: RoutineTask, checked: boolean) => void;
}
export const RoutineComponent = ({ task: routine, onCheckChange }: Props) => {
  
  const id = `routine-${routine.name}`

  return (
    <label className="dr-routine" htmlFor={id}>
      {/* 전체적으로 감싸주는 label */}
      <label htmlFor={id} className="dr-routine__item">
        {/* 체크박스(hidden) */}
        <input onChange={(e) => onCheckChange(routine, e.target.checked)} type="checkbox" id={id} className="hidden"/>
        {/* 체크박스(display) */}
        <label htmlFor={id} className="dr-routine__cbx">
          <svg viewBox="0 0 14 12">
            <polyline points="1 7.6 5 11 13 1"></polyline>
          </svg>
        </label>
        {/* 루틴 이름 */}
        <label htmlFor={id} className="dr-routine__name">{routine.name}</label>
      </label>
    </label>
  )
}