import { DailyRoutineObsidianView } from "@app/obsidian-view";
import { useTabHeight } from "@app/ui/use-tab-height";
import { createContext, useContext, useMemo } from "react";




type TileHeightInfo = {
  tileHeight: number;
  limitedTaskPer: number;
}


const TileHeightInfoContext = createContext<TileHeightInfo>({
  tileHeight: 0,
  limitedTaskPer: 0
});


export const useTileHeightInfo = () => {
  const context = useContext(TileHeightInfoContext);
  if(!context){
    throw new Error("TileHeightInfoContext not found.");
  }
  return context;
}

type Props = {
  children: React.ReactNode;
}
export const TileHeightInfoProvider = ({ children }: Props) => {
  const height = useTabHeight();
  const info = useMemo(() => {
    let info: TileHeightInfo;
    if(height < 548){
      info = {
        tileHeight: 77,
        limitedTaskPer: 4
      }
    }
    else if(height < 800){
      info = {
        tileHeight: 88,
        limitedTaskPer: 5
      }
    }
    else {
      info = {
        tileHeight: 100,
        limitedTaskPer: 6
      }
    }
    return info;
  }, [height]);

  return (
    <TileHeightInfoContext.Provider value={info}>
      {children}
    </TileHeightInfoContext.Provider>
  )
}