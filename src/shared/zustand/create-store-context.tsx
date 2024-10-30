/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useContext와 zustand store를 결합하여 사용할 수 있도록 해주는 유틸함수. 
 * zustand store를 특정 컨텍스트하에서, 특정 값을 가지고 초기화할 수 있도록 한다. 
 */
import { StoreApi, useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import React from 'react';
import { on } from 'events';



/**
 * D: 초기 데이터 타입
 * S: store 상태 타입
 */
type SetState<S> = (partial: S | Partial<S> | ((state: S) => S | Partial<S>), replace?: boolean | undefined) => void
type GetState<S> = () => S
type Initializer<D, S> = (data: D, set: SetState<S>, get: GetState<S>) => S


// 해당 함수는 '(초기데이터, set, get) => store' 형태의 콜백을 받아서 초기데이터를 기반으로 store를 생성해주는 함수를 반환한다.
const createStoreWithInit: <D, S>(initializer: Initializer<D, S>) => (data: D) => StoreApi<S>
= (initializer) => {
  return (data) => createStore((set, get) => initializer(data, set, get));
}


type ExtractState<S> = S extends {
  getState: () => infer T;
} ? T : never;
type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>;
export type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = {
  (): ExtractState<S>;
  <U>(selector: (state: ExtractState<S>) => U): U;
} & S;


interface StoreContextProviderProps<D, S> {
  data: D;
  children: React.ReactNode;
  onDataChange: (store: StoreApi<S>, data: D) => void;
}
export const createStoreContext = <D, S>(initializer: Initializer<D, S>): {
  StoreProvider: React.FC<StoreContextProviderProps<D, S>>,
  useStoreHook: UseBoundStore<StoreApi<S>>
} => {
  const StoreContext = createContext<StoreApi<S> | null>(null);
  const createNewStore = createStoreWithInit<D, S>(initializer);


  const Provider = React.memo(function Provider({ data, children, onDataChange }: StoreContextProviderProps<D, S>) {
    const storeRef = useRef<StoreApi<S>>(createNewStore(data));

    useEffect(() => {
      onDataChange(storeRef.current, data);
    }, [data, onDataChange]);
    
    
    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    )
  });


  const useStoreHook = ((selector?: any) => {
    const store = useContext(StoreContext);
    if (!store) throw new Error("해당 context에서는 store가 정의되지 않습니다. 올바른 컨텍스트에서 접근가능");
    Object.assign(useStoreHook, store);
    return useStore(store, selector);
  }) as UseBoundStore<StoreApi<S>>;

  return { StoreProvider: Provider, useStoreHook: useStoreHook };
}