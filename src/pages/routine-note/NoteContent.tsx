/** @jsxImportSource @emotion/react */

import { NoteHeader } from "./NoteHeader";
import { TasksAndRoutines } from "./TasksAndRoutines";
import { WeeksWidget } from "./weeks/WeeksWidget";


const addTodoIcon = "square-check";


export const NoteContent = () => {
  // const AddTodoModal = useAddTodoModal();
  // const StartRoutineModal = useStartRoutineModal();
  // const CreateGroupModal = useCreateGroupModal();

  // const onNoteMenuShow = useCallback((m: Menu) => {
  //   // Start New Routine
  //   m.addItem(item => {
  //     item.setIcon(startRoutineIcon);
  //     item.setTitle("Start new routine");
  //     item.onClick(() => {
  //       StartRoutineModal.open({});
  //     });
  //   });

  //   // Add Todo
  //   m.addSeparator();
  //   m.addItem(item => {
  //     item.setIcon(addTodoIcon);
  //     item.setTitle("Add todo");
  //     item.onClick(() => {
  //       AddTodoModal.open({});
  //     });
  //   });

  //   // Add Group
  //   m.addSeparator();
  //   m.addItem(item => {
  //     item.setIcon("folder");
  //     item.setTitle("Add group");
  //     item.onClick(() => {
  //       CreateGroupModal.open({});
  //     });
  //   });

  //   // mergeNotes
  //   m.addSeparator();
  //   m.addItem(item => {
  //     item.setIcon("merge");
  //     item.setTitle("Merge notes");
  //     item.onClick(() => {
  //       merge();
  //       new Notice("All Notes Merged!");
  //     });
  //   });

  // }, [AddTodoModal, CreateGroupModal, StartRoutineModal, merge]);

  return (
    <div
      css={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <WeeksWidget />
      <NoteHeader />
      <TasksAndRoutines />
      {/* <AddTodoModal />
      <StartRoutineModal />
      <CreateGroupModal /> */}
    </div>
  );
}