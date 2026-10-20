import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PitchDeckUpload } from "./pitch-deck-upload";

// Mock the API
jest.mock("@/lib/api/me", () => ({
  meApi: {
    uploadPitchDeck: jest.fn(),
    deletePitchDeck: jest.fn(),
    getPitchDeckUrl: jest.fn(() => "http://localhost:8080/api/v1/me/pitch-deck"),
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

const mockUpload = meApi.uploadPitchDeck as jest.MockedFunction<typeof meApi.uploadPitchDeck>;
const mockDelete = meApi.deletePitchDeck as jest.MockedFunction<typeof meApi.deletePitchDeck>;

describe("PitchDeckUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders upload area when no pitch deck exists", () => {
    render(<PitchDeckUpload />);
    
    expect(screen.getByText(/drag and drop your pitch deck/i)).toBeInTheDocument();
    expect(screen.getByText(/pdf only, max 10 mb/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();
  });

  it("renders current pitch deck when initialPitchDeck is provided", () => {
    render(
      <PitchDeckUpload
        initialPitchDeck={{
          fileName: "my-deck.pdf",
          sizeBytes: 5242880,
          uploadedAt: "2024-01-15T10:00:00Z",
        }}
      />
    );
    
    expect(screen.getByText("my-deck.pdf")).toBeInTheDocument();
    expect(screen.getByText(/5\.0 MB/)).toBeInTheDocument();
    expect(screen.getByText(/replace with new file/i)).toBeInTheDocument();
  });

  it("validates file size before upload", async () => {
    render(<PitchDeckUpload />);
    
    const file = new File(["x".repeat(11 * 1024 * 1024)], "large.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    // File too large - upload should not be called
    await waitFor(() => {
      expect(mockUpload).not.toHaveBeenCalled();
    });
  });

  it("validates file type before upload", async () => {
    render(<PitchDeckUpload />);
    
    const file = new File(["content"], "image.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    // Wrong file type - upload should not be called
    await waitFor(() => {
      expect(mockUpload).not.toHaveBeenCalled();
    });
  });

  it("uploads valid PDF file", async () => {
    mockUpload.mockResolvedValueOnce({
      fileName: "uploaded.pdf",
      sizeBytes: 1024000,
      uploadedAt: "2024-01-15T10:00:00Z",
    });
    const onSuccess = jest.fn();
    
    render(<PitchDeckUpload onUploadSuccess={onSuccess} />);
    
    const file = new File(["pdf content"], "test.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(file);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("deletes pitch deck when delete button clicked", async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    const onDeleteSuccess = jest.fn();
    
    render(
      <PitchDeckUpload
        initialPitchDeck={{ fileName: "deck.pdf", sizeBytes: 1024 }}
        onDeleteSuccess={onDeleteSuccess}
      />
    );
    
    const deleteButton = screen.getByRole("button", { name: /delete pitch deck/i });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
      expect(onDeleteSuccess).toHaveBeenCalled();
    });
  });

  it("shows error when upload fails", async () => {
    mockUpload.mockRejectedValueOnce(new Error("Upload failed"));
    
    render(<PitchDeckUpload />);
    
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    // Wait for upload to be called
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
    });
    
    // After error, should return to upload area (wait for loading to finish)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();
    });
  });
});
