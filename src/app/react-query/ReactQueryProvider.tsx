import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./query-client"




export const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  )
}