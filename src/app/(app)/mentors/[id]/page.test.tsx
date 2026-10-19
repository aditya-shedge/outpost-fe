import { render, screen, waitFor } from "@testing-library/react";
import MentorDetailPage from "./page";

// Mock modules
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "mentor-1" }),
}));

const mockMentor = {
  id: "mentor-1",
  name: "Jane Doe",
  photoUrl: "https://example.com/photo.jpg",
  headline: "CEO at TechCorp | Ex-Google",
  bio: "20+ years of experience in technology startups.",
  experience: "Built and sold 3 companies. Advised 50+ startups.",
  expertise: ["Fundraising", "Product", "Strategy"],
  links: [
    { linkType: "LinkedIn", url: "https://linkedin.com/in/janedoe" },
    { linkType: "Twitter", url: "https://twitter.com/janedoe" },
  ],
  bookingUrl: "https://cal.com/janedoe",
};

let mockMentorData = mockMentor;

jest.mock("@/lib/api/mentors", () => ({
  getMentorById: jest.fn(() => Promise.resolve(mockMentorData)),
}));

describe("MentorDetailPage", () => {
  beforeEach(() => {
    mockMentorData = mockMentor;
    jest.clearAllMocks();
  });

  it("renders breadcrumb navigation", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Mentors")).toBeInTheDocument();
    });
  });

  it("renders mentor name and headline", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
      expect(screen.getByText("CEO at TechCorp | Ex-Google")).toBeInTheDocument();
    });
  });

  it("renders mentor photo", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      const photo = screen.getByAltText("Jane Doe");
      expect(photo).toHaveAttribute("src", "https://example.com/photo.jpg");
    });
  });

  it("renders bio section", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("20+ years of experience in technology startups.")).toBeInTheDocument();
    });
  });

  it("renders experience section", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Experience")).toBeInTheDocument();
      expect(screen.getByText("Built and sold 3 companies. Advised 50+ startups.")).toBeInTheDocument();
    });
  });

  it("renders all expertise tags", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Fundraising")).toBeInTheDocument();
      expect(screen.getByText("Product")).toBeInTheDocument();
      expect(screen.getByText("Strategy")).toBeInTheDocument();
    });
  });

  it("renders links section", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Links")).toBeInTheDocument();
      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      expect(screen.getByText("X/Twitter")).toBeInTheDocument();
    });
  });

  it("renders Book a call button with Cal.com link", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      const bookButton = screen.getByRole("link", { name: /Book a call/i });
      expect(bookButton).toHaveAttribute("href", "https://cal.com/janedoe");
      expect(bookButton).toHaveAttribute("target", "_blank");
    });
  });

  it("renders booking info note", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Sessions are scheduled via Cal.com/)).toBeInTheDocument();
    });
  });

  it("renders back to mentors link", async () => {
    render(<MentorDetailPage />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /Back to mentors/i });
      expect(backLink).toHaveAttribute("href", "/mentors");
    });
  });

  it("shows initials when no photo", async () => {
    mockMentorData = { ...mockMentor, photoUrl: "" };
    
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });
});

describe("MentorDetailPage - Error handling", () => {
  it("shows error message when mentor not found", async () => {
    const { getMentorById } = require("@/lib/api/mentors");
    getMentorById.mockRejectedValueOnce(new Error("Not found"));
    
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Mentor not found/)).toBeInTheDocument();
    });
  });

  it("shows back link when error occurs", async () => {
    const { getMentorById } = require("@/lib/api/mentors");
    getMentorById.mockRejectedValueOnce(new Error("Not found"));
    
    render(<MentorDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("← Back to mentors")).toBeInTheDocument();
    });
  });
});
