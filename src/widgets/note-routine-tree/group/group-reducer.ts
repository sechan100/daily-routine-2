import { RoutineGroup, RoutineGroupProperties } from "@/entities/routine-like";


export type GroupReduceAction =
  {
    type: "SET_NAME",
    payload: string;
  } | {
    type: "SET_PROPERTIES",
    payload: Partial<RoutineGroupProperties>;
  }

export type GroupReducer = (state: RoutineGroup, action: GroupReduceAction) => RoutineGroup;


export const groupReducer: GroupReducer = (state, action) => {
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