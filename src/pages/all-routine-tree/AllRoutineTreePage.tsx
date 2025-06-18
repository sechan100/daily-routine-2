import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { AllRoutineTree } from "./AllRoutineTree";




export const AllRoutineTreePage = () => {

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <h3>Something went wrong</h3>
              <button onClick={resetErrorBoundary}>
                Try again
              </button>
            </div>
          )}
        >
          <AllRoutineTree />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}