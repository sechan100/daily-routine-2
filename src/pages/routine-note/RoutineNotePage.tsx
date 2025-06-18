import { PageLayout } from "@/components/PageLayout";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { NoteHeader } from "./NoteHeader";
import { TasksAndRoutines } from "./TasksAndRoutines";
import { WeeksWidget } from "./weeks/WeeksWidget";




export const RoutineNotePage = () => {

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
            <WeeksWidget />
            <NoteHeader />
            <TasksAndRoutines />
          </PageLayout>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}