import { render } from "@testing-library/react";
import { Icon, IconName } from "./icon";

describe("Icon", () => {
  const iconNames: IconName[] = [
    "arrow",
    "bookmark",
    "calendar",
    "chevron-down",
    "clock",
    "grid",
    "home",
    "mentors",
    "search",
    "sparkles",
  ];

  it.each(iconNames)("renders %s icon as SVG", (name) => {
    const { container } = render(<Icon name={name} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies default size-5 class", () => {
    const { container } = render(<Icon name="home" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-5");
  });

  it("applies custom className", () => {
    const { container } = render(<Icon name="home" className="size-8 text-gold" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-8");
    expect(svg).toHaveClass("text-gold");
  });

  it("returns null for unknown icon name", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const { container } = render(<Icon name={"unknown" as IconName} />);
    expect(container.firstChild).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Icon "unknown" not found');
    consoleSpy.mockRestore();
  });
});
