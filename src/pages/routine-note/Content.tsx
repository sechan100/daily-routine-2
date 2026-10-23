/** @jsxImportSource @emotion/react */
import { isTask, isTaskGroup } from '@entities/note';
import { noteViewEvents, useNoteFileSync, useRoutineNote } from "@features/note";
import { renderTask, TaskDndContext } from '@features/task-el';
import { t } from '@shared/i18n';
import { Day } from '@shared/period/day';
import { useToday } from '@shared/today/use-today';
import { dr } from "@shared/utils/daily-routine-bem";
import { useStartRoutineModal } from '@widgets/routine';
import { TaskGroupWidget, useCreateGroupModal } from '@widgets/task-group';
import { useAddTodoModal } from '@widgets/todo';
import { WeeksWidget } from "@widgets/weeks";
import { Menu, Notice } from "obsidian";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRoutineMutationMerge } from '@features/merge-note';
import { NoteEmptyState } from './NoteEmptyState';
import { NOTE_CONTENT_MAX_WIDTH, NoteHeader } from './NoteHeader';
import { useTodayRollover } from './use-today-rollover';


const startRoutineIcon = "alarm-clock-plus";
const addTodoIcon = "list-plus";

const bem = dr("note");


export const RoutineNoteContent = () => {
  const note = useRoutineNote(n=>n.note);
  const setNote = useRoutineNote(n=>n.setNote);
  const { mergeNotes } = useRoutineMutationMerge();
  useNoteFileSync();
  useTodayRollover();
  const today = useToday(s => s.today);

  // 명령 구독 콜백에서 최신 노트를 읽기 위한 ref
  const noteRef = useRef(note);
  noteRef.current = note;

  const AddTodoModal = useAddTodoModal();
  const StartRoutineModal = useStartRoutineModal();
  const CreateGroupModal = useCreateGroupModal();

  const openAddTodo = useCallback(() => AddTodoModal.open({}), [AddTodoModal]);
  const openStartRoutine = useCallback(() => StartRoutineModal.open({}), [StartRoutineModal]);

  const [weeksRecenterSignal, setWeeksRecenterSignal] = useState(0);
  const goToToday = useCallback(() => {
    if(noteRef.current.day.isToday()){
      // 이미 오늘을 보고 있다면 다른 주로 넘겨둔 주간 바만 오늘의 주로 되돌린다.
      setWeeksRecenterSignal(n => n + 1);
    } else {
      setNote(Day.today());
    }
  }, [setNote]);

  // 명령(command palette, 단축키)으로 들어온 동작
  useEffect(() => noteViewEvents.subscribe(action => {
    switch(action.type){
      case "add-todo":
        openAddTodo();
        break;
      case "start-routine":
        openStartRoutine();
        break;
      case "go-to-today":
        goToToday();
        break;
      case "shift-day":
        setNote(noteRef.current.day.clone(m => m.add(action.offset, "day")));
        break;
    }
  }), [goToToday, openAddTodo, openStartRoutine, setNote]);

  const syncNotesWithRoutines = useCallback(async () => {
    // 실패한 노트가 있으면 mergeNotes가 직접 알린다.
    if(await mergeNotes()) new Notice(t("shell.note.synced"));
  }, [mergeNotes]);

  const onNoteMenuShow = useCallback((m: Menu) => {
    m.addItem(item => {
      item.setIcon(addTodoIcon);
      item.setTitle(t("shell.action.addTodo"));
      item.onClick(openAddTodo);
    });
    m.addItem(item => {
      item.setIcon(startRoutineIcon);
      item.setTitle(t("shell.action.startRoutine"));
      item.onClick(openStartRoutine);
    });
    m.addItem(item => {
      item.setIcon("folder-plus");
      item.setTitle(t("shell.action.addGroup"));
      item.onClick(() => {
        CreateGroupModal.open({});
      });
    });

    m.addSeparator();
    m.addItem(item => {
      item.setIcon("refresh-cw");
      item.setTitle(t("shell.action.syncNotes"));
      item.onClick(() => {
        void syncNotesWithRoutines();
      });
    });
  }, [CreateGroupModal, openAddTodo, openStartRoutine, syncNotesWithRoutines]);

  // 날짜를 바꾸면 목록을 맨 위부터 보여준다.
  // 실제 스크롤 컨테이너는 TaskDndContext 안쪽에 있으므로, 목록에서 바깥 컨테이너까지 올라가며 모두 되돌린다.
  const tasksRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dayKey = note.day.format();
  useLayoutEffect(() => {
    const boundary = tasksRef.current;
    let el: HTMLElement | null = listRef.current;
    while(el && boundary){
      el.scrollTop = 0;
      if(el === boundary) break;
      el = el.parentElement;
    }
  }, [dayKey]);

  const isEmpty = note.children.length === 0;

  return (
    <div
      className={bem()}
      css={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <WeeksWidget className={bem("weeks")} recenterSignal={weeksRecenterSignal} />
      <NoteHeader
        className={bem("header")}
        day={note.day}
        today={today}
        onGoToToday={goToToday}
        onAddTodo={openAddTodo}
        onMenuShow={onNoteMenuShow}
      />
      <div
        ref={tasksRef}
        className={bem("tasks")}
        css={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <TaskDndContext>
          <div
            ref={listRef}
            css={{
              maxWidth: NOTE_CONTENT_MAX_WIDTH,
              margin: "0 auto",
              height: isEmpty ? "100%" : undefined,
            }}
          >
            {isEmpty ? (
              <NoteEmptyState onAddTodo={openAddTodo} onStartRoutine={openStartRoutine} />
            ) : note.children.map(el => {
              if(isTaskGroup(el)) {
                return (
                  <TaskGroupWidget
                    key={`${note.day.format()}-${el.elementType}-${el.name}`}
                    group={el}
                  />)
              } else if(isTask(el)) {
                return renderTask(el, null);
              } else {
                return null;
              }
            })}
          </div>
        </TaskDndContext>
      </div>
      <AddTodoModal />
      <StartRoutineModal />
      <CreateGroupModal />
    </div>
  );
}
