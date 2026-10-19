import { render, screen } from "@testing-library/react";
import { SpotlightSection } from "./spotlight-section";
import type { SpotlightFounder } from "@/lib/api/spotlight";

const mockFounder: SpotlightFounder = {
  id: "founder-1",
  founderName: "Jane Doe",
  startupName: "TechStartup Inc",
  oneLiner: "Building the future of AI",
  photoUrl: "https://example.com/photo.jpg",
};

describe("SpotlightSection", () => {
  it("renders founder of the day label", () => {
    render(<SpotlightSection founder={mockFounder} />);

    expect(screen.getByText("Founder of the Day")).toBeInTheDocument();
  });

  it("displays founder name and startup", () => {
    render(<SpotlightSection founder={mockFounder} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("TechStartup Inc")).toBeInTheDocument();
  });

  it("displays one-liner", () => {
    render(<SpotlightSection founder={mockFounder} />);

    expect(screen.getByText("Building the future of AI")).toBeInTheDocument();
  });

  it("renders view profile link", () => {
    render(<SpotlightSection founder={mockFounder} />);

    const link = screen.getByRole("link", { name: /view profile/i });
    expect(link).toHaveAttribute("href", "/founders/founder-1");
  });

  it("shows photo when photoUrl is provided", () => {
    render(<SpotlightSection founder={mockFounder} />);

    const img = screen.getByRole("img", { name: "Jane Doe" });
    expect(img).toBeInTheDocument();
  });

  it("shows initials when no photoUrl", () => {
    const founderWithoutPhoto = { ...mockFounder, photoUrl: undefined };
    render(<SpotlightSection founder={founderWithoutPhoto} />);

    expect(screen.getByText("J")).toBeInTheDocument();
  });
});
