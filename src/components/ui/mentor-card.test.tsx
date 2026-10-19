import { render, screen } from "@testing-library/react";
import { MentorCard, MentorCardSkeleton } from "./mentor-card";
import type { MentorWithAi } from "@/lib/api/types";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockMentor: MentorWithAi = {
  id: "mentor-1",
  name: "Jane Doe",
  headline: "CEO at TechCorp",
  photoUrl: "https://example.com/photo.jpg",
  expertise: ["Fundraising", "Product", "Marketing"],
};

const mockMentorNoPhoto: MentorWithAi = {
  ...mockMentor,
  id: "mentor-2",
  photoUrl: undefined,
};

const mockMentorManyTags: MentorWithAi = {
  ...mockMentor,
  id: "mentor-3",
  expertise: ["Fundraising", "Product", "Marketing", "Sales", "Strategy", "Operations"],
};

const mockMentorWithAi: MentorWithAi = {
  ...mockMentor,
  id: "mentor-4",
  aiApplied: true,
  aiReason: "Great match for your fundraising needs",
};

describe("MentorCard", () => {
  it("renders mentor name and headline", () => {
    render(<MentorCard mentor={mockMentor} />);
    
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("CEO at TechCorp")).toBeInTheDocument();
  });

  it("renders mentor photo when available", () => {
    render(<MentorCard mentor={mockMentor} />);
    
    const photo = screen.getByAltText("Jane Doe");
    expect(photo).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("renders initials when no photo", () => {
    render(<MentorCard mentor={mockMentorNoPhoto} />);
    
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders expertise tags", () => {
    render(<MentorCard mentor={mockMentor} />);
    
    expect(screen.getByText("Fundraising")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Marketing")).toBeInTheDocument();
  });

  it("truncates tags and shows +N more", () => {
    render(<MentorCard mentor={mockMentorManyTags} />);
    
    // Should show first 3 tags
    expect(screen.getByText("Fundraising")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Marketing")).toBeInTheDocument();
    
    // Should show +3 more (6 - 3 = 3)
    expect(screen.getByText("+3 more")).toBeInTheDocument();
  });

  it("links to mentor detail page", () => {
    render(<MentorCard mentor={mockMentor} />);
    
    const link = screen.getByRole("link", { name: /View profile/i });
    expect(link).toHaveAttribute("href", "/mentors/mentor-1");
  });

  it("shows AI reason when showAiReason is true", () => {
    render(<MentorCard mentor={mockMentorWithAi} showAiReason />);
    
    expect(screen.getByText("Great match for your fundraising needs")).toBeInTheDocument();
  });

  it("hides AI reason when showAiReason is false", () => {
    render(<MentorCard mentor={mockMentorWithAi} showAiReason={false} />);
    
    expect(screen.queryByText("Great match for your fundraising needs")).not.toBeInTheDocument();
  });

  it("renders light variant by default", () => {
    const { container } = render(<MentorCard mentor={mockMentor} />);
    
    const article = container.querySelector("article");
    expect(article).toHaveClass("bg-paper-light");
  });

  it("renders dark variant when specified", () => {
    const { container } = render(<MentorCard mentor={mockMentor} variant="dark" />);
    
    const article = container.querySelector("article");
    expect(article).toHaveClass("bg-[#1e2b24]");
  });
});

describe("MentorCardSkeleton", () => {
  it("renders skeleton loader", () => {
    const { container } = render(<MentorCardSkeleton />);
    
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders light variant by default", () => {
    const { container } = render(<MentorCardSkeleton />);
    
    expect(container.firstChild).toHaveClass("bg-paper-light");
  });

  it("renders dark variant when specified", () => {
    const { container } = render(<MentorCardSkeleton variant="dark" />);
    
    expect(container.firstChild).toHaveClass("bg-[#1e2b24]");
  });
});
