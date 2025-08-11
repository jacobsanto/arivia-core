import { useEffect } from "react";
import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { toastService } from "@/services/toast";

export type AppQueryOptions<TQueryFnData, TError = Error, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, any[]>,
  "queryKey" | "queryFn"
> & {
  showToastOnError?: boolean;
  errorTitle?: string;
};

export function useAppQuery<TQueryFnData, TError = Error, TData = TQueryFnData>(
  queryKey: any[],
  queryFn: () => Promise<TQueryFnData>,
  options?: AppQueryOptions<TQueryFnData, TError, TData>
): UseQueryResult<TData, TError> {
  const { showToastOnError = true, errorTitle = "Failed to load data", ...rest } = options || {};

  const result = useQuery<TQueryFnData, TError, TData>({
    queryKey,
    queryFn,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...rest,
  });

  useEffect(() => {
    if ((result as any).isError && showToastOnError) {
      const err: any = (result as any).error;
      const description = typeof err?.message === "string" ? err.message : undefined;
      toastService.error(errorTitle, { description });
    }
  }, [showToastOnError, errorTitle, (result as any).isError]);

  return result;
}
