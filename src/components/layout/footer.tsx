import { Brand } from "@/components/ui/brand";

export function Footer() {
  return (
    <footer className="border-t border-line py-6 px-[max(5.7vw,24px)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-muted text-[10px]">
        <Brand compact />
        <span>For the people building what&apos;s next.</span>
        <span className="mono-label">T-HUB · HYDERABAD</span>
      </div>
    </footer>
  );
}

export default Footer;
