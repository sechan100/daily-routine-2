import clsx from "clsx";
import { Routine, routineManager } from "entities/routine";
import { DayOfWeek, DAY_OF_WEEKS, dayOfWeekToString } from "libs/day";
import { TextComponent } from "obsidian";
import { useCallback, useEffect, useRef, useState } from "react";




interface DaysOptionProps {
  daysSet: Set<DayOfWeek>;
}
export const DaysOption = ({ daysSet }: DaysOptionProps) => {
  // 날짜 하나하나 클릭시
  const onDayClick = useCallback((e: React.MouseEvent) => {
    e.currentTarget.classList.toggle("dr-routine-option__day--active");
    const isActive = e.currentTarget.classList.contains("dr-routine-option__day--active");
    const dayOfWeek = Number(e.currentTarget.getAttribute('data-day')) as DayOfWeek;
    if(isActive){
      daysSet.add(dayOfWeek);
    } else {
      daysSet.delete(dayOfWeek);
    }
  }, [daysSet])

  return (
    <div className="dr-routine-option__section dr-routine-option__days">
      <h6>Days</h6>
      <div className="dr-routine-option__day-list">
        {DAY_OF_WEEKS.map((dayOfWeek, idx) => {
          const isActive = daysSet.has(dayOfWeek);
          return (
            <button key={idx} data-day={dayOfWeek} onClick={onDayClick} className={clsx({"dr-routine-modal__day--active": isActive})}>
              {dayOfWeekToString(dayOfWeek)}
            </button>
          )
        })}
      </div>
    </div>
  )
}



interface RenameOptionProps {
  initialName: string;
  onSave: (name: string) => void;
}
export const RenameOption = ({ initialName, onSave }: RenameOptionProps) => {
  // 이름 수정
  const nameEditElRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(initialName);
  useEffect(() => {
    if(!nameEditElRef.current) return;
    const textComp = new TextComponent(nameEditElRef.current)
    .setValue(name)
    .onChange((value) => {
      setName(value);
    });
    textComp.inputEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') onSave(name) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="dr-routine-option__section dr-routine-option__name">
      <h6>Name</h6>
      <div ref={nameEditElRef} />
      <button onClick={() => onSave(name)}>Save</button>
    </div>
  )
}