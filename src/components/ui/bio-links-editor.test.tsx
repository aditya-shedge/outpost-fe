import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BioLinksEditor } from "./bio-links-editor";

// Mock the API
jest.mock("@/lib/api/me", () => ({
  meApi: {
    updateEnrichedProfile: jest.fn(),
  },
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    custom: jest.fn(),
  }),
}));

import { meApi } from "@/lib/api/me";
import { toast } from "sonner";

const mockUpdate = meApi.updateEnrichedProfile as jest.MockedFunction<typeof meApi.updateEnrichedProfile>;

describe("BioLinksEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders bio textarea with character count", () => {
    render(<BioLinksEditor />);
    
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByText("0 / 2000")).toBeInTheDocument();
  });

  it("updates character count as bio is typed", () => {
    render(<BioLinksEditor />);
    
    const textarea = screen.getByLabelText(/bio/i);
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    
    expect(screen.getByText("11 / 2000")).toBeInTheDocument();
  });

  it("populates with initial bio and links", () => {
    render(
      <BioLinksEditor
        initialBio="My startup bio"
        initialLinks={[{ type: "LINKEDIN", url: "https://linkedin.com/in/test" }]}
      />
    );
    
    expect(screen.getByDisplayValue("My startup bio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://linkedin.com/in/test")).toBeInTheDocument();
  });

  it("allows adding links up to max 5", () => {
    render(<BioLinksEditor />);
    
    // Add 5 links by clicking add link button
    for (let i = 0; i < 5; i++) {
      const addButtons = screen.getAllByRole("button").filter(btn => btn.textContent?.toLowerCase().includes("add link"));
      if (addButtons.length > 0) {
        fireEvent.click(addButtons[0]);
      }
    }
    
    // After 5 links, add link button should be gone
    const addButtonsAfter = screen.queryAllByRole("button").filter(btn => btn.textContent?.toLowerCase().includes("add link"));
    expect(addButtonsAfter).toHaveLength(0);
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
  });

  it("allows removing links", () => {
    render(
      <BioLinksEditor
        initialLinks={[
          { type: "LINKEDIN", url: "https://linkedin.com/in/test" },
          { type: "X", url: "https://x.com/test" },
        ]}
      />
    );
    
    expect(screen.getAllByRole("button", { name: /remove link/i })).toHaveLength(2);
    
    fireEvent.click(screen.getAllByRole("button", { name: /remove link/i })[0]);
    
    expect(screen.getAllByRole("button", { name: /remove link/i })).toHaveLength(1);
  });

  it("shows save button only when changes are made", () => {
    render(<BioLinksEditor initialBio="Original bio" />);
    
    expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
    
    const textarea = screen.getByLabelText(/bio/i);
    fireEvent.change(textarea, { target: { value: "Modified bio" } });
    
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("saves changes successfully", async () => {
    mockUpdate.mockResolvedValueOnce({ bio: "New bio", links: [] });
    const onSaveSuccess = jest.fn();
    
    render(<BioLinksEditor onSaveSuccess={onSaveSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: "New bio" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ bio: "New bio", links: null });
      expect(onSaveSuccess).toHaveBeenCalled();
    });
  });

  it("resets changes on cancel", () => {
    render(<BioLinksEditor initialBio="Original bio" />);
    
    const textarea = screen.getByLabelText(/bio/i);
    fireEvent.change(textarea, { target: { value: "Modified bio" } });
    
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    
    expect(screen.getByDisplayValue("Original bio")).toBeInTheDocument();
  });
});
