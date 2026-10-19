import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookmarkButton } from "./bookmark-button";
import { SavedItemsProvider } from "@/lib/saved/context";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<SavedItemsProvider>{ui}</SavedItemsProvider>);
};

describe("BookmarkButton", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders unsaved state by default", () => {
    renderWithProvider(
      <BookmarkButton item={{ id: "1", type: "grant", name: "Test Grant" }} />
    );

    const button = screen.getByRole("button", { name: /save for later/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles to saved state on click", async () => {
    renderWithProvider(
      <BookmarkButton item={{ id: "1", type: "grant", name: "Test Grant" }} />
    );

    const button = screen.getByRole("button", { name: /save for later/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /remove from saved/i })
      ).toBeInTheDocument();
    });
  });

  it("toggles back to unsaved state on second click", async () => {
    renderWithProvider(
      <BookmarkButton item={{ id: "1", type: "grant", name: "Test Grant" }} />
    );

    const button = screen.getByRole("button");
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    await userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("persists saved state across re-renders", async () => {
    const { rerender } = renderWithProvider(
      <BookmarkButton item={{ id: "1", type: "grant", name: "Test Grant" }} />
    );

    const button = screen.getByRole("button");
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    // Re-render with same provider to check state persists
    rerender(
      <SavedItemsProvider>
        <BookmarkButton item={{ id: "1", type: "grant", name: "Test Grant" }} />
      </SavedItemsProvider>
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("stops event propagation to prevent card navigation", async () => {
    const parentClickHandler = jest.fn();

    render(
      <SavedItemsProvider>
        <div onClick={parentClickHandler}>
          <BookmarkButton
            item={{ id: "1", type: "grant", name: "Test Grant" }}
          />
        </div>
      </SavedItemsProvider>
    );

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});
