/** @jsxImportSource @emotion/react */
import { routineManager } from "@entities/routine";
import { Routine } from "@entities/routine";
import { Notice } from "obsidian";
import { ActiveCriteriaOption } from "./ui/ ActiveCriteriaOption";
import { DAYS_OF_WEEK } from "@shared/day";
import { useCallback, useState, useMemo } from "react";
import { createModal } from "@shared/components/modal/create-modal";
import { TextEditComponent } from "@shared/components/TextEditComponent";
import { dr } from "@shared/daily-routine-bem";
import { Modal } from "@shared/components/modal/styled";
import { ModalApi } from "@shared/components/modal/create-modal";
import { Button } from "@shared/components/Button";
import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";
import { useRoutineNote } from "@entities/note";
import { set } from "lodash";




export const useStartRoutineModal = createModal(({ modal }: { modal: ModalApi}) => {
  const { note, setNote } = useRoutineNote();
  const [ routine, setRoutine ] = useState<Routine>({
    name: "",
    properties: {
      order: 0,
      activeCriteria: "week",
      daysOfWeek: DAYS_OF_WEEK,
      daysOfMonth: [],
    }
  });


  const setProperties = useCallback((propertiesPartial: Partial<Routine["properties"]>) => {
    setRoutine({
      ...routine,
      properties: {
        ...routine.properties,
        ...propertiesPartial
      }
    });
  }, [routine]);


  // 루틴 생성 콜백
  const onSaveBtnClick = useCallback(async () => {
    try {
      await routineManager.create(routine);
      new Notice(`Routine '${routine.name}' started! 🎉`);
      // precond: routineManager.create 함수가 루틴을 반드시 맨 앞 순서에 만든다고 가정
      setNote({
        ...note,
        tasks: [
          routineManager.deriveRoutineToTask(routine),
          ...note.tasks
        ]
      })

      executeRoutineNotesSynchronize();
      modal.close();
    } catch(e) {
      new Notice(e.message);
    }
  }, [modal, note, routine, setNote]);


  const bem = useMemo(() => dr("start-new-routine"), []);
  return (
    <Modal header="Start New Routine" className={bem()} modal={modal}>
      <Modal.Section className={bem("name")}>
        <Modal.Name>Name</Modal.Name>
        <TextEditComponent
          value={routine.name}
          onChange={name => setRoutine({...routine, name})}
          placeholder="New Daily Routine"
        />
      </Modal.Section>
      <Modal.Separator />

      {/* activeCriteria */}
      <Modal.Section className={bem("criteria")} >
        <Modal.Name>Active Criteria</Modal.Name>
        <nav className={bem("criteria-nav")}>
          <Button
            css={{marginRight: "0.5em"}}
            variant={routine.properties.activeCriteria === "week" ? "accent" : "primary"}
            onClick={() => setProperties({activeCriteria: "week"})}
          >Week
          </Button>
          <Button
            variant={routine.properties.activeCriteria === "month" ? "accent" : "primary"}
            onClick={() => setProperties({activeCriteria: "month"})}
          >Month
          </Button>
        </nav>
      </Modal.Section>
      <ActiveCriteriaOption
        criteria={routine.properties.activeCriteria}
        css={{
          padding: "1em 0"
        }}
        className={bem("days")} 
        properties={routine.properties} 
        setProperties={setProperties}
      />
      <Modal.Separator />

      {/* save */}
      <Modal.Section>
        <Button
          css={{
            width: "100%",
          }}
          disabled={routine.name.trim() === ""}
          variant={routine.name.trim() === "" ? "disabled" : "accent"}
          onClick={onSaveBtnClick}
        >
          Save
        </Button>
      </Modal.Section>
    </Modal>
  )
}, {
  sidebarLayout: true,
});