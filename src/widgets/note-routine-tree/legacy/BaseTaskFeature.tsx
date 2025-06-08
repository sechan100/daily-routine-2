
// interface BaseCheckableProps<T extends Checkable> {
//   checkable: T;
//   parent: TaskGroup | null;
//   onOptionMenu: (m: Menu, task: T) => void | Promise<void>;

//   className?: string;
//   onTaskReorder?: (note: RoutineNote, task: T) => void;
//   onStateChange?: (task: T) => void;
// }
// export const BaseTaskFeature = React.memo(<T extends Task>({
//   checkable,
//   parent,
//   className,
//   onTaskReorder,
//   onOptionMenu,
//   onStateChange
// }: BaseCheckableProps<T>) => {

//   // click
//   const disableTouch = useRef<boolean>(false);
//   const onClick = useCallback(async (e: React.TouchEvent | React.MouseEvent) => {
//     if (disableTouch.current) return;
//     disableTouch.current = true;
//     // HACK: 이유는 모르겠지만 이거 안하면 모바일 환경에서 모달이 열리자마다 닫혀버림.
//     e.preventDefault();

//     const destState: TaskState = checkable.state === "un-checked" ? "accomplished" : "un-checked";
//     let doUncheck = true;
//     if (SETTINGS.getConfirmUncheckTask() && checkable.state !== "un-checked") {
//       doUncheck = await doConfirm({
//         title: "UnCheck Task",
//         description: "Are you sure you want to uncheck this task?",
//         confirmText: "UnCheck",
//         confirmBtnVariant: "accent",
//       })
//     }
//     if (doUncheck) {
//       const newNote = await checkCheckable(note, checkable.name, destState);
//       setNote(newNote);
//       if (onStateChange) onStateChange({ ...checkable, checked: destState });
//     }

//     // HACK: 빠르게 인접한 task를 클릭하면 클릭히 씹히거나 두번 클릭되는 문제가 있어서, 일단 0.5초 정도 막아둠으로 해결
//     setTimeout(() => {
//       disableTouch.current = false;
//     }, 500);
//   }, [note, onStateChange, setNote, checkable])


//   return (
//     <></>
//   )
// })