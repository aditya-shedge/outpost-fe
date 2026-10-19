import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="size-16 rounded-full bg-gold-light flex items-center justify-center mb-4">
        <Icon name={icon} className="size-7 text-gold-dark" />
      </div>
      <h3 className="font-serif text-lg font-semibold text-ink mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-muted max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoResultsState({
  searchTerm,
  onClear,
}: {
  searchTerm?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description={
        searchTerm
          ? `We couldn't find anything matching "${searchTerm}". Try adjusting your filters.`
          : "Try adjusting your filters or search terms."
      }
      action={onClear ? { label: "Clear filters", onClick: onClear } : undefined}
    />
  );
}

export function NoDataState({
  resource,
  description,
}: {
  resource: string;
  description?: string;
}) {
  return (
    <EmptyState
      icon="grid"
      title={`No ${resource} yet`}
      description={description || `${resource} will appear here once they're available.`}
    />
  );
}

export function NoBookmarksState({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon="bookmark"
      title="No saved items"
      description="Bookmark opportunities to easily find them later."
      action={onBrowse ? { label: "Browse opportunities", onClick: onBrowse } : undefined}
    />
  );
}
