"use client";

import { useSavedItems, SavedItem } from "@/lib/saved/context";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  item: Omit<SavedItem, "savedAt">;
  className?: string;
}

export function BookmarkButton({ item, className }: BookmarkButtonProps) {
  const { isSaved, toggleSave } = useSavedItems();
  const saved = isSaved(item.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(item);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-2 transition-colors rounded-sm hover:bg-paper-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2",
        className
      )}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      aria-pressed={saved}
    >
      {saved ? (
        <BookmarkFilledIcon className="w-5 h-5 text-gold" />
      ) : (
        <BookmarkIcon className="w-5 h-5 text-muted hover:text-ink" />
      )}
    </button>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookmarkFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default BookmarkButton;
