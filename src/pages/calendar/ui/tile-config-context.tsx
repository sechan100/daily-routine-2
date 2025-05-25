import { useTabHeight } from "@app/ui/use-tab-height";
import { createContext, useContext, useMemo } from "react";




type TileConfig = {
  tileHeight: number;
  limitedTaskPer: number;
}


const TileConfigContext = createContext<TileConfig | null>(null);


export const useTileConfig = (): TileConfig => {
  const context = useContext(TileConfigContext);
  if (!context) {
    throw new Error("TileConfigContext not found.");
  }
  return context;
}

type Props = {
  children: React.ReactNode;
}
export const TileConfigProvider = ({ children }: Props) => {
  const height = useTabHeight();
  const config = useMemo(() => {
    let tc: TileConfig;
    if (height < 548) {
      tc = {
        tileHeight: 77,
        limitedTaskPer: 4
      }
    }
    else if (height < 800) {
      tc = {
        tileHeight: 88,
        limitedTaskPer: 5
      }
    }
    else {
      tc = {
        tileHeight: 100,
        limitedTaskPer: 6
      }
    }
    return tc;
  }, [height]);

  return (
    <TileConfigContext.Provider value={config}>
      {children}
    </TileConfigContext.Provider>
  )
}