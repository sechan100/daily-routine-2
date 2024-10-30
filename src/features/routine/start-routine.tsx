/** @jsxImportSource @emotion/react */
import { routineManager } from "entities/routine";
import { Routine } from "entities/routine";
import { Notice } from "obsidian";
import { DaysOption } from "./DaysOption";
import { DAYS_OF_WEEK } from "shared/day";
import { memo, useCallback, useState, useMemo } from "react";
import { createModal } from "shared/components/modal/create-modal";
import { TextEditComponent } from "shared/components/TextEditComponent";
import { ActiveButton } from "shared/components/ToggleButton";
import { dr } from "shared/daily-routine-bem";
import { drEvent } from "shared/event";
import { Modal } from "shared/components/modal/styled";
import { ModalApi } from "shared/components/modal/create-modal";




export const useStartRoutineModal = createModal(({ modal }: { modal: ModalApi}) => {
  const [ routine, setRoutine ] = useState<Routine>({
    name: "new daily routine",
    properties: {
      order: 0,
      activeCriteria: "week",
      daysOfWeek: DAYS_OF_WEEK,
      daysOfMonth: [],
    }
  });

  const setName = useCallback((name: string) => {
    setRoutine({
      ...routine,
      name
    });
  }, [routine]);

  const setProperties = useCallback((properties: Routine["properties"]) => {
    setRoutine({
      ...routine,
      properties
    });
  }, [routine]);

  const changeActiveCriteria = useCallback((activeCriteria: Routine["properties"]["activeCriteria"]) => {
    setProperties({
      ...routine.properties,
      activeCriteria
    });
  }, [routine.properties, setProperties]);


  const onRoutineSave = useCallback(async (isRoutineSaveActive: boolean) => {
    if(!isRoutineSaveActive) new Notice("Complete the form to save the routine");

    try {
      await routineManager.create(routine);
      drEvent.emit("createRoutine", {name: routine.name})
      modal.close();
      new Notice(`Routine '${routine.name}' started! 🎉`);
    } catch(e) {
      new Notice(e.message);
    }
  }, [modal, routine]);


  const bem = useMemo(() => dr("start-new-routine"), []);
  return (
    <Modal header="Start New Routine" className={bem()} modal={modal}>
      <Modal.Section className={bem("name")}>
        <Modal.Name>Name</Modal.Name>
        <TextEditComponent
          value={routine.name}
          onBlur={setName} 
        />
      </Modal.Section>
      <Modal.Separator />

      {/* activeCriteria */}
      <Modal.Section className={bem("criteria")} >
        <Modal.Name>Active Criteria</Modal.Name>
        <nav className={bem("criteria-nav")}>
          <ActiveButton
            css={{marginRight: "0.5em"}}
            active={routine.properties.activeCriteria === "week"} 
            onClick={() => changeActiveCriteria("week")}
          >Week
          </ActiveButton>
          <ActiveButton
            active={routine.properties.activeCriteria === "month"}
            onClick={() => changeActiveCriteria("month")}
          >Month
          </ActiveButton>
        </nav>
      </Modal.Section>
      <DaysOption
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
        <ActiveButton
          width="100%"
          active={routine.name.trim() !== ""}
          onClick={() => onRoutineSave(routine.name.trim() !== "")}
        >
          Save
        </ActiveButton>
      </Modal.Section>
    </Modal>
  )
}, {
  sidebarLayout: true,
});