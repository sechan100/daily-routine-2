/** @jsxImportSource @emotion/react */
import { routineManager } from "entities/routine";
import { Routine } from "entities/routine";
import { plugin } from "shared/plugin-service-locator";
import { Modal, Notice, TextComponent } from "obsidian";
import { createRoot } from "react-dom/client";
import { DaysOption } from "./DaysOption";
import { DAYS_OF_WEEK, DayOfWeek } from "shared/day";
import { useRef, useEffect, useReducer, memo, useCallback, useState, useMemo } from "react";
import { Button } from "shared/components/Button";
import { modalComponent, useModal } from "shared/components/modal";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Container } from "shared/components/Container";
import { textCss } from "shared/components/font";
import { Section } from "shared/components/Section";
import { TextEditComponent } from "shared/components/TextEditComponent";
import { ActiveButton } from "shared/components/ToggleButton";
import { dr } from "shared/daily-routine-bem";
import { drEvent } from "shared/event";



const Name = styled.div`
  ${textCss.medium}
`;
const Description = styled.div`
  ${textCss.description}
`;



const defaultRoutine: Routine = {
  name: "new daily routine",
  properties: {
    order: 0,
    activeCriteria: "week",
    daysOfWeek: DAYS_OF_WEEK,
    daysOfMonth: [],
  }
}

export const openStartNewRoutineModal = modalComponent(memo(() => {
  const [ routine, setRoutine ] = useState<Routine>(defaultRoutine);
  const modal = useModal();

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
    <>
      {/* name */}
      <Section 
        className={bem("name")}
        css={css`
          .is-phone & {
            border-top: none;
          }
        `}
      >
        <Name>Name</Name>
        <TextEditComponent
          value={routine.name}
          onBlur={setName} 
        />
      </Section>

      {/* activeCriteria */}
      <Section className={bem("criteria")} >
        <Name>Active Criteria</Name>
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
      </Section>
      <DaysOption
        criteria={routine.properties.activeCriteria}
        css={{
          padding: "1em 0"
        }}
        className={bem("days")} 
        properties={routine.properties} 
        setProperties={setProperties}
      />

      {/* save */}
      <Section>
        <ActiveButton
          width="100%"
          active={routine.name.trim() !== ""}
          onClick={() => onRoutineSave(routine.name.trim() !== "")}
        >
          Save
        </ActiveButton>
      </Section>
    </>
  )
}), {
  sidebarLayout: true,
  title: "Start New Routine",
});