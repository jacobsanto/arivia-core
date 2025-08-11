import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { toastService } from "@/services/toast";

export type AppMutationOptions<TData, TError, TVariables, TContext> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
};

export function useAppMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: AppMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {
    successTitle = "Saved",
    successDescription,
    errorTitle = "Operation failed",
    showSuccessToast = true,
    showErrorToast = true,
    ...rest
  } = options || {};

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...rest,
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toastService.success(successTitle, { description: successDescription });
      }
      rest?.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      if (showErrorToast) {
        const description = typeof (err as any)?.message === "string" ? (err as any).message : undefined;
        toastService.error(errorTitle, { description });
      }
      rest?.onError?.(err, variables, context);
    },
  });
}
