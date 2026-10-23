/** @jsxImportSource @emotion/react */
import { useRoutineNote } from "@features/note";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { TEXT_CSS } from "@shared/components/text-style";
import { Day } from "@shared/period/day";
import { formatFullDate, t } from "@shared/i18n";
import { Notice } from "obsidian";
import { useCallback, useEffect, useRef, useState } from "react";
import { rescheduleTodo } from "../reschedule-todo";


// 기본값은 내일이다. 지금 보고 있는 노트가 내일 노트라면 그 다음 날을 쓴다.
const defaultDestination = (noteDay: Day): Day => {
  const tomorrow = Day.tomorrow();
  return tomorrow.isSameDay(noteDay) ? noteDay.clone(m => m.add(1, "day")) : tomorrow;
}


interface RescheduleTodoModalProps {
  taskName: string;
  modal: ModalApi;
}
export const useRescheduleTodoModal = createModal(({ taskName, modal }: RescheduleTodoModalProps) => {
  const { note, setNote } = useRoutineNote();
  const [dateText, setDateText] = useState(() => defaultDestination(note.day).format());
  const inputRef = useRef<HTMLInputElement>(null);

  // 날짜를 지우면 빈 문자열이 되므로, 유효한 날짜일 때만 대상 날짜로 인정한다.
  const destDay = Day.isValidFormat(dateText) ? Day.fromString(dateText) : null;
  const isSameDay = destDay !== null && destDay.isSameDay(note.day);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSaveBtnClick = useCallback(async () => {
    if(!destDay || isSameDay) return;
    // 실패한 이유는 rescheduleTodo가 Notice로 알린다.
    const result = await rescheduleTodo(note, taskName, destDay);
    if(result.isErr()) return;
    setNote(result.value);
    modal.close();
    new Notice(t("tasks.todo.rescheduled", { name: taskName, date: formatFullDate(destDay) }));
  }, [destDay, isSameDay, modal, note, setNote, taskName]);


  return (
    <Modal header={t("tasks.todo.rescheduleTitle")} modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* date */}
      <Modal.Section name={t("tasks.todo.rescheduleDate")}>
        <input
          ref={inputRef}
          type="date"
          value={dateText}
          onChange={e => setDateText(e.target.value)}
        />
      </Modal.Section>
      {isSameDay && (
        <div css={[TEXT_CSS.description, TEXT_CSS.errorColor, { paddingTop: "0.7em", textAlign: "end" }]}>
          {t("tasks.todo.alreadyOnDay")}
        </div>
      )}
      <Modal.Separator edgeWithtransparent />

      {/* save */}
      <Modal.SaveBtn
        name={t("tasks.todo.reschedule")}
        disabled={destDay === null || isSameDay}
        onSaveBtnClick={onSaveBtnClick}
      />
    </Modal>
  );
}, {
  // 입력 항목이 적어 화면을 덮는 큰 모달 대신 작은 모달로 띄운다.
  sidebarLayout: false,
});
