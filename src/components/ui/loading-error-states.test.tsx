import { render, screen, fireEvent } from "@testing-library/react";
import {
  LoadingSpinner,
  PageLoader,
  ErrorBoundary,
  ErrorFallback,
  EmptyState,
  NoResultsState,
} from "./index";

// LoadingSpinner tests
describe("LoadingSpinner", () => {
  it("renders with default size", () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("size-5");
  });

  it("renders with large size", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-8");
  });
});

// PageLoader tests
describe("PageLoader", () => {
  it("renders spinner variant by default", () => {
    render(<PageLoader />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders cards variant", () => {
    const { container } = render(<PageLoader variant="cards" cardCount={3} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// ErrorBoundary tests
describe("ErrorBoundary", () => {
  // Suppress console.error for this test
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders fallback when there is an error", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

// ErrorFallback tests
describe("ErrorFallback", () => {
  it("renders error message", () => {
    render(<ErrorFallback error={new Error("Custom error message")} />);
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = jest.fn();
    render(<ErrorFallback onRetry={onRetry} />);
    
    const retryButton = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });
});

// EmptyState tests
describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No items"
        description="There are no items to display."
      />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("There are no items to display.")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: "Add item", onClick }}
      />
    );
    
    const button = screen.getByRole("button", { name: "Add item" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});

// NoResultsState tests
describe("NoResultsState", () => {
  it("renders search term in message", () => {
    render(<NoResultsState searchTerm="test query" />);
    expect(screen.getByText(/test query/)).toBeInTheDocument();
  });

  it("renders clear filters button when onClear is provided", () => {
    const onClear = jest.fn();
    render(<NoResultsState onClear={onClear} />);
    
    const button = screen.getByRole("button", { name: "Clear filters" });
    fireEvent.click(button);
    expect(onClear).toHaveBeenCalled();
  });
});
