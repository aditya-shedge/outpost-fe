import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon, IconName } from "./icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: IconName;
  iconPosition?: "left" | "right";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const variants = {
      primary:
        "bg-ink text-paper-light border-ink hover:bg-[#304258] focus-visible:ring-ink",
      secondary:
        "bg-transparent text-ink border-ink hover:bg-ink/5 focus-visible:ring-ink",
      ghost:
        "bg-transparent text-ink border-transparent hover:bg-ink/5 focus-visible:ring-ink",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-12 px-6 text-sm gap-2.5",
    };

    const iconSizes = {
      sm: "size-3.5",
      md: "size-4",
      lg: "size-4",
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold border transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Icon name="loader" className={iconSizes[size]} />
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <Icon name={icon} className={iconSizes[size]} />
            )}
            {children}
            {icon && iconPosition === "right" && (
              <Icon name={icon} className={iconSizes[size]} />
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
