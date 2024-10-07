import { Dispatch, SetStateAction, useEffect, useState } from "react";



export const useSyncedState = <S>(props: S): [S, Dispatch<SetStateAction<S>>] => {
  const [state, setState] = useState<S>(props);

  useEffect(() => {
    setState(props);
  }, [props]);

  return [state, setState];
}