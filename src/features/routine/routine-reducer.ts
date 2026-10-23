import { Routine, RoutineProperties } from "@entities/routine";
import { t } from "@shared/i18n";


export type RoutineReduceAction = 
{
  type: "SET_NAME",
  payload: string;
} | {
  type: "SET_PROPERTIES",
  payload: Partial<RoutineProperties>;
}

export interface RoutineReducer {
  (state: Routine, action: RoutineReduceAction): Routine;
}


export const routineReducer: RoutineReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        name: action.payload,
      }
    case 'SET_PROPERTIES':
      return {
        ...state,
        properties: {
          ...state.properties,
          ...action.payload,
        }
      }
    default:
      throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
  }
};


/**
 * active criteria 설정이 루틴을 한 번도 수행하지 않게 되는지 검사한다.
 * @returns 저장할 수 없는 이유(사용자에게 보여줄 문구). 저장해도 되면 null
 */
export const getActiveCriteriaError = (p: RoutineProperties): string | null => {
  switch(p.activeCriteria){
    case "week": return p.daysOfWeek.length === 0 ? t("tasks.criteria.weekError") : null;
    case "month": return p.daysOfMonth.length === 0 ? t("tasks.criteria.monthError") : null;
    // 입력을 지우는 중간 상태는 NaN으로 들어오므로, 저장 시점에 여기서 걸러낸다.
    case "interval": return Number.isInteger(p.intervalDays) && p.intervalDays >= 1 ? null : t("tasks.criteria.intervalError");
  }
}
