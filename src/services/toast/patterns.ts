import { toastService } from "./toast.service.tsx";

export const ToastPatterns = {
  networkError(error?: unknown, context?: string) {
    const description = typeof (error as any)?.message === "string" ? (error as any).message : undefined;
    toastService.error(context ? `${context} failed` : "Network error", { description });
  },
  saved(entity?: string) {
    toastService.success(entity ? `${entity} saved` : "Saved", { description: "Your changes have been saved." });
  },
  updated(entity?: string) {
    toastService.success(entity ? `${entity} updated` : "Updated", { description: "Your changes have been updated." });
  },
  deleted(entity?: string) {
    toastService.success(entity ? `${entity} deleted` : "Deleted", { description: "The item has been removed." });
  },
  action(title: string, description?: string) {
    toastService.show(title, { description });
  }
};

export default ToastPatterns;
