/**
 * useContext와 zustand store를 결합하여 사용할 수 있도록 해주는 유틸함수. 
 * zustand store를 특정 컨텍스트하에서, 특정 값을 가지고 초기화할 수 있도록 한다. 
 */
import { StoreApi, useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { createContext, useContext, useEffect, useRef } from 'react';
import React from 'react';



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


interface StoreContextProviderProps<D, S> {
  initialData: D;
  onDataChanged?: (state: S, data: D) => void;
  children: React.ReactNode;
}
export const createStoreContext = <D, S>(initializer: Initializer<D, S>): {
  context: React.FC<StoreContextProviderProps<D, S>>,
  useStoreHook: <R>(selector: (state: S) => R) => R;
} => {
  const StoreContext = createContext<StoreApi<S> | null>(null);
  const store = createStoreWithInit<D, S>(initializer);

  /**
   * Provider 컴포넌트의 initialData는 최초 store 초기화만을 담당한다.
   * 그 이후 변경된 데이터에 대한 처리는 onDataChanged 콜백을 이용하도록한다.
   * 
   * 만약 onDataChanged가 주어지지 않으면, initialData가 변경될 때마다 해당 context에서 관리되는 store 인스턴스 자체가 초기화된다.
   * 이 경우 하위 모든 컴포넌트들이 리렌더링되므로 주의.
   */
  const Provider = React.memo(function Provider({ initialData, onDataChanged, children }: StoreContextProviderProps<D, S>) {
    const storeRef = useRef(store(initialData));
    useEffect(() => {
      if(onDataChanged){
        onDataChanged(storeRef.current.getState(), initialData);
      }
    }, [initialData, onDataChanged]);
    return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
  }, (prev, next) => {
    // onDataChanged가 정의되었다면 컴포넌트를 절대 리렌더링되지 않는다.
    if(prev.onDataChanged){
      return true;
    // onDataChanged가 정의되지 않았다면, initialData가 변경될 때마다 리렌더링된다.
    } else {
      return prev.initialData !== next.initialData;
    }
  });


  const useStoreHook: <R>(selector:(state: S) => R) => R 
  = (selector) => {
    const store = useContext(StoreContext);
    if (!store) throw new Error("해당 context에서는 store가 정의되지 않습니다. 올바른 컨텍스트에서 접근가능");
    return useStore(store, selector);
  }
  
  return { context: Provider, useStoreHook };
}