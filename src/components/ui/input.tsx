import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full h-12 px-4 border bg-paper-light text-ink text-sm",
          "placeholder:text-placeholder",
          "focus:outline-none focus:border-ink transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error ? "border-rose" : "border-line",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
