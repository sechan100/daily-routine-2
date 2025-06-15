/* eslint-disable @typescript-eslint/no-explicit-any */
import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';


type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;
type FunctionReturningPromise = (...args: any[]) => Promise<any>;
type AsyncState<T> =
  | {
    loading: boolean;
    error?: undefined;
    value?: undefined;
  }
  | {
    loading: true;
    error?: Error | undefined;
    value?: T;
  }
  | {
    loading: false;
    error: Error;
    value?: undefined;
  }
  | {
    loading: false;
    error?: undefined;
    value: T;
  };
type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> = AsyncState<
  PromiseType<ReturnType<T>>
>;


export function useAsync<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList,
): StateFromFunctionReturningPromise<T> {
  const mountedRef = useRef<boolean>(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; }
  }, []);

  const lastCallId = useRef(0);
  const [state, set] = useState<StateFromFunctionReturningPromise<T>>({ loading: true });

  const callback = useCallback((...args: Parameters<T>): ReturnType<T> => {
    const callId = ++lastCallId.current;
    set((prevState) => ({ ...prevState, loading: true }));

    return fn(...args).then(
      (value) => {
        if (mountedRef.current && callId === lastCallId.current) {
          set({ value, loading: false });
        }
        return value;
      },
      (error) => {
        if (mountedRef.current && callId === lastCallId.current) {
          set({ error, loading: false });
        }
        return error;
      }
    ) as ReturnType<T>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    (callback as unknown as T)();
  }, [callback]);


  return state;
}