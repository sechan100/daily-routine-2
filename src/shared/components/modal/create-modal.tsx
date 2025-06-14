import { getPlugin } from '@/app/plugin';
import { queryClient } from '@/app/react-query/query-client';
import { QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query';
import { Modal } from 'obsidian';
import { ComponentType, createContext, PropsWithChildren, Suspense, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';


type CreateModalOptions = {
  sidebarLayout: boolean;
}

const ModalContext = createContext<Modal | null>(null);

export const useModal = (): Modal => {
  const modal = useContext(ModalContext);
  if (!modal) {
    throw new Error("useModal must be used within a ModalContext.Provider");
  }
  return modal;
}

/**
 * @param ModalContent 해당 컴포넌트로 전달되는 props는 modal open 함수의 매개변수로 전달되는 값이므로
 * props 변경에 따른 리렌더링이 발생하지 않는다. 따라서 단순히 데이터 전달 목적으로만 사용해야한다. 
 * @param options 
 * @returns 
 */
export const createModal = <P,>(ModalContent: ComponentType<P>, options: CreateModalOptions) => {
  let modal: Modal;

  // Modal 컴포넌트
  const ModalComponent = (props: P) => {
    if (!modal) {
      throw new Error("ModalComponent must be used within a modal context. Use openModal to create and open the modal.");
    }
    return (
      <QueryClientProvider client={queryClient}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ error, resetErrorBoundary }) => (
                <div>
                  <h2>문제가 발생했습니다!</h2>
                  <button onClick={resetErrorBoundary}>
                    다시 시도
                  </button>
                </div>
              )}
            >
              <Suspense fallback={<div>Loading...</div>}>
                <ModalContext.Provider value={modal}>
                  <ModalContent {...props as PropsWithChildren<P>} />
                </ModalContext.Provider>
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </QueryClientProvider>
    );
  }

  const openModal = (props: P) => {
    modal = new Modal(getPlugin().app);
    // sidebar layout 설정
    if (options.sidebarLayout) {
      modal.modalEl.addClass("mod-sidebar-layout");
    }
    // 기본값 flex에서 -> block으로 변경
    modal.contentEl.setCssStyles({
      display: "block",
      overflow: "auto",
      padding: "0",
    })

    // open
    const container = modal.contentEl;
    const root = createRoot(container);
    root.render(<ModalComponent {...props as PropsWithChildren<P>} />);
    modal.open();
  }

  return openModal;
}