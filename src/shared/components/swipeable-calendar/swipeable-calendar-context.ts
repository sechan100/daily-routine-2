import { createContext, useContext } from "react";




export type SwipeableCalendarContextType = {
  tileHeight: number;
  weekdaysHeight: number;
  weekdaysPaddingY: number;
}
export const SwipeableCalendarContext = createContext<SwipeableCalendarContextType>({
  tileHeight: 0,
  weekdaysHeight: 0,
  weekdaysPaddingY: 0
});


export const useSwipeableCalendarContext = () => {
  const context = useContext(SwipeableCalendarContext);
  if (!context) {
    throw new Error("useSwipeableCalendarContext must be used within a SwipeableCalendarContext.Provider");
  }
  return context;
}