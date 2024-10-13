/**
 * useState와 store를 동기화해준다. 
 * 상위 컴포넌트에서 사용하는 useState를 하위 레이어들에게 context로, 또는 store 상태로 전달하고싶을 때 유용하다.
 * 이렇게하면 하위 컴포넌트에서 상위 컴포넌트의 state를 변경하는 것도 가능하다.
 */
import { StoreApi, useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useRef } from 'react';
import React from 'react';


// useState Return Value의 타입을 정의
// ReturnType<typeof useState>는 [S, Dispatch<SetStateAction<S>>] 타입을 반환하고, 0번 인덱스의 falsy함을 제거하지 못함.
export interface UseStateRv<S> {
  state: S;
  setState: Dispatch<SetStateAction<S>>;
}
// useState의 반환값을 UseStateRv로 변환해주는 함수
const getUseStateRvFromUseStateReturnType = function<S>(useState: UseState<S>): UseStateRv<S> {
  if(Array.isArray(useState)) {
    return {
      state: useState[0],
      setState: useState[1]
    }
  } else {
    return useState;
  }
}

// 어떤 형태의 useState든...
type UseState<S> = UseStateRv<S> | [S, Dispatch<SetStateAction<S>>]

// store 타입
interface UseStateSyncStore<S>{
  state: S;
  setState: (state: S) => void;
}

// <S>() => (useStateRv: UseStateRv<S>) => StoreApi<UseStateSyncStore<S>></UseStateSyncStore>
// 해당 함수는 useState를 받아서 store를 생성후 동기화해서 반환하는 함수를 반환한다.
const createSyncedStore = <S,>(useStateRv: UseStateRv<S>): StoreApi<UseStateSyncStore<S>> => {
  const store = createStore<UseStateSyncStore<S>>((set, get) => ({
    state: useStateRv.state,
    setState: (state: S) => {
      set({ state });
      if(!Object.is(useStateRv.state, state)){
        useStateRv.setState(state)
      }
    }
  }));
  return store;
}


interface StoreContextProviderProps<S> {
  useState: UseState<S>;
  children: React.ReactNode;
}
export const createUseStateSyncedStore = <S,>(): {
  StoreProvider: React.FC<StoreContextProviderProps<S>>,
  useStoreHook: () => [S, (state: S) => void];
} => {
  const StoreContext = createContext<StoreApi<UseStateSyncStore<S>> | null>(null);

  /**
   * Provider 컴포넌트의 initialData는 최초 store 초기화만을 담당한다.
   * 그 이후 변경된 데이터에 대한 처리는 onDataChanged 콜백을 이용하도록한다.
   * 
   * 만약 onDataChanged가 주어지지 않으면, initialData가 변경될 때마다 해당 context에서 관리되는 store 인스턴스 자체가 초기화된다.
   * 이 경우 하위 모든 컴포넌트들이 리렌더링되므로 주의.
   */
  const Provider = React.memo(function Provider({ useState, children }: StoreContextProviderProps<S>) {
    const useStateRv = getUseStateRvFromUseStateReturnType(useState);
    const storeRef = useRef(createSyncedStore(useStateRv));

    useEffect(() => {
      if(!Object.is(storeRef.current.getState().state, useStateRv.state)){
        storeRef.current.setState({state: useStateRv.state});
      }
    }, [useStateRv.state])

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    )
  });


  const useStoreHook = (): [S, (state: S) => void] => {
    const store = useContext(StoreContext);
    if (!store) throw new Error("해당 context에서는 store가 정의되지 않습니다. 올바른 컨텍스트에서 접근가능");
    const {state, setState} = useStore(store);
    return [state, setState];
  }
  
  return { StoreProvider: Provider, useStoreHook };
}