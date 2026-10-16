import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[550px] py-24 px-[max(9.7vw,32px)] bg-[#f3f0e7] paper-grid">
          <div className="max-w-[1120px] mx-auto">
            <div className="rise-in">
              <p className="mono-label text-gold-dark flex items-center gap-2 mb-6">
                <span className="w-[7px] h-[7px] rounded-full bg-gold" />
                T-HUB FOUNDER DIRECTORY
                <span className="text-muted">· PRIVATE TO MEMBERS</span>
              </p>
              
              <h1 className="font-serif font-bold text-[clamp(54px,6vw,79px)] leading-[0.99] tracking-[-0.07em] mb-6">
                Good people.<br />
                <span className="text-gold-hover">Good openings.</span><br />
                One place.
              </h1>
              
              <p className="max-w-[480px] text-muted leading-[1.75] text-[15px] mb-7">
                A working directory for the next step in your startup. Find relevant funding, 
                programs and mentors—without chasing links across ten different chats.
              </p>
              
              <div className="flex items-center gap-6 flex-wrap">
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center gap-5 min-h-[48px] px-5 border border-ink bg-ink font-semibold text-[13px] transition-all hover:translate-y-[-2px] hover:bg-[#304258]"
                  style={{ color: '#f7f4ec' }}
                >
                  I&apos;m a T-Hub founder
                  <ArrowIcon />
                </Link>
                
                <Link 
                  href="#featured" 
                  className="inline-flex items-center gap-2 text-muted text-[12px] font-semibold hover:text-gold-dark"
                >
                  See what&apos;s inside
                  <ArrowDownIcon />
                </Link>
              </div>
              
              <div className="flex items-center gap-2 text-muted text-[11px] mt-8">
                <LockIcon />
                <span>
                  Private access for Google accounts ending in <strong className="text-ink font-semibold">@thub.com</strong>
                </span>
              </div>
            </div>
          </div>
          
          <div className="max-w-[1120px] mx-auto mt-16 flex justify-between text-[#a5a097] font-mono text-[9px] tracking-[0.12em]">
            <span>BUILT FOR THE WORK AHEAD</span>
            <span>HYDERABAD · INDIA</span>
          </div>
        </section>

        {/* Count Strip */}
        <section className="min-h-[98px] border-y border-line flex items-center justify-center gap-0 bg-paper-light">
          <div className="flex items-center gap-3 px-9 min-h-[42px] border-r border-line">
            <CompassIcon />
            <span className="text-muted text-[12px] font-semibold">A clearer way forward</span>
          </div>
          <CountItem number="01" label="Funding paths" />
          <CountItem number="02" label="Challenges" />
          <CountItem number="03" label="Mentor connections" />
        </section>

        {/* Featured Section Placeholder */}
        <section id="featured" className="max-w-[1100px] mx-auto py-24 px-7">
          <div className="flex items-end justify-between gap-7 mb-8">
            <div>
              <p className="mono-label text-gold-dark mb-3">A FIRST LOOK</p>
              <h2 className="font-serif font-bold text-[clamp(34px,4vw,49px)] leading-[1.05] tracking-[-0.06em]">
                Useful by design.
              </h2>
            </div>
            <p className="max-w-[280px] text-muted text-[12px] leading-[1.7]">
              Every listing is here to help you make a move—not just keep scrolling.
            </p>
          </div>
          
          <div className="min-h-[120px] border border-dashed border-line flex items-center justify-center gap-3 text-muted text-[12px]">
            <SearchIcon />
            <span>Current listings are kept inside the member directory. Sign in to search the full collection.</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CountItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-9 min-h-[42px] border-r border-line last:border-r-0">
      <strong className="font-serif font-bold text-[25px] text-ink tracking-[-0.06em]">{number}</strong>
      <span className="text-muted text-[11px]">{label}</span>
    </div>
  );
}

// Simple icons
function ArrowIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7l10 10M17 7v10H7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-hover">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-hover">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-hover">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
