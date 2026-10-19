"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { Icon } from "./icon";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "bg-paper-light border border-line shadow-lg p-4 flex items-start gap-3 w-full max-w-sm",
          title: "font-medium text-ink text-sm",
          description: "text-muted text-sm mt-1",
          actionButton:
            "bg-gold text-white text-sm font-medium px-3 py-1.5 hover:bg-gold-hover",
          cancelButton:
            "bg-paper text-muted text-sm font-medium px-3 py-1.5 border border-line hover:bg-line/50",
          closeButton:
            "bg-paper-light border border-line text-muted hover:text-ink size-6",
        },
      }}
    />
  );
}

// Typed toast functions with icons
export const showToast = {
  success: (message: string, description?: string) =>
    toast.custom(() => (
      <div className="bg-paper-light border border-line shadow-lg p-4 flex items-start gap-3 w-full max-w-sm">
        <div className="size-5 rounded-full bg-green-light flex items-center justify-center shrink-0">
          <Icon name="check" className="size-3 text-green" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm">{message}</p>
          {description && <p className="text-muted text-sm mt-1">{description}</p>}
        </div>
      </div>
    )),

  error: (message: string, description?: string) =>
    toast.custom(() => (
      <div className="bg-paper-light border border-line shadow-lg p-4 flex items-start gap-3 w-full max-w-sm">
        <div className="size-5 rounded-full bg-rose-light flex items-center justify-center shrink-0">
          <Icon name="x" className="size-3 text-rose" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm">{message}</p>
          {description && <p className="text-muted text-sm mt-1">{description}</p>}
        </div>
      </div>
    )),

  info: (message: string, description?: string) =>
    toast.custom(() => (
      <div className="bg-paper-light border border-line shadow-lg p-4 flex items-start gap-3 w-full max-w-sm">
        <div className="size-5 rounded-full bg-gold-light flex items-center justify-center shrink-0">
          <Icon name="info" className="size-3 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm">{message}</p>
          {description && <p className="text-muted text-sm mt-1">{description}</p>}
        </div>
      </div>
    )),

  loading: (message: string) =>
    toast.custom(() => (
      <div className="bg-paper-light border border-line shadow-lg p-4 flex items-start gap-3 w-full max-w-sm">
        <Icon name="loader" className="size-5 text-gold shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm">{message}</p>
        </div>
      </div>
    )),

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string;
      error: string;
    }
  ) => toast.promise(promise, options),

  dismiss: toast.dismiss,
};

// Re-export for direct usage
export { toast };
