import { Routine, RoutineProperties } from "@entities/routine";


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
      throw new Error(`Unhandled action type: ${action}`);
  }
};