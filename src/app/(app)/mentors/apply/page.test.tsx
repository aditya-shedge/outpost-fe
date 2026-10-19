import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorApplyPage from "./page";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockApplyMentor = jest.fn();

jest.mock("@/lib/api/mentors", () => ({
  applyMentor: (...args: unknown[]) => mockApplyMentor(...args),
}));

describe("MentorApplyPage", () => {
  beforeEach(() => {
    mockApplyMentor.mockClear();
    mockApplyMentor.mockResolvedValue(undefined);
  });

  it("renders page title", () => {
    render(<MentorApplyPage />);
    
    expect(screen.getByText("Share Your Expertise")).toBeInTheDocument();
    expect(screen.getByText(/Join our community of mentors/)).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<MentorApplyPage />);
    
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Headline/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Bio/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cal.com Booking URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Photo URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/LinkedIn URL/)).toBeInTheDocument();
  });

  it("renders expertise selection buttons", () => {
    render(<MentorApplyPage />);
    
    expect(screen.getByRole("button", { name: "Fundraising" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Product" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marketing" })).toBeInTheDocument();
  });

  it("validates Cal.com URL format", async () => {
    const user = userEvent.setup();
    render(<MentorApplyPage />);
    
    // Fill in other required fields
    await user.type(screen.getByLabelText(/Full Name/), "Jane Doe");
    await user.type(screen.getByLabelText(/^Email/), "jane@example.com");
    await user.type(screen.getByLabelText(/Headline/), "CEO at TechCorp");
    await user.type(screen.getByLabelText(/^Bio/), "20 years experience");
    await user.type(screen.getByLabelText(/Cal.com Booking URL/), "https://calendly.com/user");
    await user.click(screen.getByRole("button", { name: "Fundraising" }));
    
    const submitButton = screen.getByRole("button", { name: "Submit Application" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid cal.com URL")).toBeInTheDocument();
    });
  });

  it("toggles expertise selection", async () => {
    const user = userEvent.setup();
    render(<MentorApplyPage />);
    
    const fundraisingButton = screen.getByRole("button", { name: "Fundraising" });
    
    // Initially not selected
    expect(fundraisingButton).not.toHaveClass("bg-green");
    
    // Click to select
    await user.click(fundraisingButton);
    expect(fundraisingButton).toHaveClass("bg-green");
    
    // Click again to deselect
    await user.click(fundraisingButton);
    expect(fundraisingButton).not.toHaveClass("bg-green");
  });

  it("validates max 5 expertise areas", async () => {
    const user = userEvent.setup();
    render(<MentorApplyPage />);
    
    // Select 6 expertise areas
    const expertiseButtons = [
      "Fundraising", "Product", "Marketing", "Sales", "Operations", "Technology"
    ];
    
    for (const exp of expertiseButtons) {
      await user.click(screen.getByRole("button", { name: exp }));
    }
    
    const submitButton = screen.getByRole("button", { name: "Submit Application" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select no more than 5 areas of expertise/)).toBeInTheDocument();
    });
  });

  it("submits form successfully and shows thank you message", async () => {
    const user = userEvent.setup();
    render(<MentorApplyPage />);
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Full Name/), "Jane Doe");
    await user.type(screen.getByLabelText(/^Email/), "jane@example.com");
    await user.type(screen.getByLabelText(/Headline/), "CEO at TechCorp");
    await user.type(screen.getByLabelText(/^Bio/), "20 years experience");
    await user.type(screen.getByLabelText(/Cal.com Booking URL/), "https://cal.com/janedoe");
    await user.click(screen.getByRole("button", { name: "Fundraising" }));
    
    const submitButton = screen.getByRole("button", { name: "Submit Application" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Application Submitted!")).toBeInTheDocument();
      expect(screen.getByText(/Our team will review your application/)).toBeInTheDocument();
    });

    expect(mockApplyMentor).toHaveBeenCalledWith({
      name: "Jane Doe",
      email: "jane@example.com",
      headline: "CEO at TechCorp",
      bio: "20 years experience",
      expertise: ["Fundraising"],
      calcomUrl: "https://cal.com/janedoe",
      photoUrl: "",
      linkedinUrl: "",
    });
  });

  it("shows error message for duplicate email", async () => {
    const { ApiClientError } = require("@/lib/api/client");
    mockApplyMentor.mockRejectedValueOnce(
      Object.assign(new Error("Conflict"), { status: 409 })
    );
    
    const user = userEvent.setup();
    render(<MentorApplyPage />);
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Full Name/), "Jane Doe");
    await user.type(screen.getByLabelText(/^Email/), "jane@example.com");
    await user.type(screen.getByLabelText(/Headline/), "CEO at TechCorp");
    await user.type(screen.getByLabelText(/^Bio/), "20 years experience");
    await user.type(screen.getByLabelText(/Cal.com Booking URL/), "https://cal.com/janedoe");
    await user.click(screen.getByRole("button", { name: "Fundraising" }));
    
    const submitButton = screen.getByRole("button", { name: "Submit Application" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit application/)).toBeInTheDocument();
    });
  });

  it("shows Return to Home link after successful submission", async () => {
    const user = userEvent.setup();
    render(<MentorApplyPage />);
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Full Name/), "Jane Doe");
    await user.type(screen.getByLabelText(/^Email/), "jane@example.com");
    await user.type(screen.getByLabelText(/Headline/), "CEO at TechCorp");
    await user.type(screen.getByLabelText(/^Bio/), "20 years experience");
    await user.type(screen.getByLabelText(/Cal.com Booking URL/), "https://cal.com/janedoe");
    await user.click(screen.getByRole("button", { name: "Fundraising" }));
    
    const submitButton = screen.getByRole("button", { name: "Submit Application" });
    await user.click(submitButton);

    await waitFor(() => {
      const homeLink = screen.getByRole("link", { name: "Return to Home" });
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });
});
