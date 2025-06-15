import { keepPreviousData, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false, // 마운트 시에 리패치
      refetchInterval: false, // 주기적 refetch 여부
      refetchIntervalInBackground: false, // 백그라운드 리패치
      refetchOnWindowFocus: false, // 윈도우 포커스 시에 리패치
      retry: 3,
      staleTime: 1000 * 60 * 5,
      placeholderData: keepPreviousData,
    }
  }
});