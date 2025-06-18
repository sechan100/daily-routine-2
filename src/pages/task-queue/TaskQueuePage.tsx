import { PageLayout } from "@/components/PageLayout";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { QueueList } from "./QueueList";
import { TaskQueueHeader } from "./TaskQueueHeader";




export const TaskQueuePage = () => {

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
            <TaskQueueHeader />
            <QueueList />
          </PageLayout>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}