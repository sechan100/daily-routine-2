/** @jsxImportSource @emotion/react */
import { PageLayout } from "@/components/PageLayout";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { AllRoutineTree } from "./AllRoutineTree";
import { Header } from "./Header";




export const RoutinesPage = () => {

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
          <PageLayout>
            <Header />
            <AllRoutineTree />
          </PageLayout>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}