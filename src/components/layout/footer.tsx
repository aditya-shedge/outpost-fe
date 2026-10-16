import { Brand } from "@/components/ui/brand";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("border-t border-line bg-paper-light", className)}>
      <div className="max-w-[1440px] mx-auto py-6 px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-muted text-xs">
          <Brand compact />
          <span>Exclusive to the T-Hub founder community</span>
          <span className="font-mono text-[10px] tracking-wider uppercase">
            T-Hub · Hyderabad
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
