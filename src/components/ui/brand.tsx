import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandProps {
  inverse?: boolean;
  compact?: boolean;
  className?: string;
}

export function Brand({ inverse = false, compact = false, className }: BrandProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 font-serif font-bold tracking-tight",
        compact ? "text-[13px] gap-2" : "text-[15px]",
        inverse ? "text-paper-light" : "text-ink",
        className
      )}
    >
      <BrandSymbol inverse={inverse} compact={compact} />
      <span>
        T-Hub <em className={cn("font-semibold not-italic", inverse ? "text-sidebar-accent" : "text-gold-hover")}>Founders</em>
      </span>
    </Link>
  );
}

function BrandSymbol({ inverse, compact }: { inverse?: boolean; compact?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full flex items-center justify-center flex-none",
        compact ? "w-[23px] h-[23px]" : "w-[27px] h-[27px]",
        inverse ? "bg-sidebar-accent" : "bg-ink"
      )}
    >
      <span
        className={cn(
          "rounded-full relative",
          compact ? "w-2 h-2 border-[1.25px]" : "w-2.5 h-2.5 border-[1.5px]",
          inverse ? "border-ink" : "border-[#e9b75f]"
        )}
      >
        <span
          className={cn(
            "absolute rounded-full",
            compact ? "w-[3px] h-[3px] top-[1.5px] left-[1.5px]" : "w-1 h-1 top-0.5 left-0.5",
            inverse ? "bg-ink" : "bg-[#e9b75f]"
          )}
        />
      </span>
    </span>
  );
}

export default Brand;
