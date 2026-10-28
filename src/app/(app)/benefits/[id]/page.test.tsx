import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BenefitDetailPage from "./page";
import * as benefitsApi from "@/lib/api/benefits";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "benefit-123" }),
}));

// Mock the API
jest.mock("@/lib/api/benefits");
const mockGetBenefit = benefitsApi.getBenefit as jest.MockedFunction<typeof benefitsApi.getBenefit>;

const mockBenefit: benefitsApi.Benefit = {
  id: "benefit-123",
  partner: { id: "partner-1", name: "AWS", website: "https://aws.amazon.com" },
  headline: "$5,000 in AWS credits",
  category: "CLOUD",
  whatYouGet: "Credits for cloud computing services",
  eligibilityNote: "Must be a T-Hub startup",
  howToClaim: "1. Sign up for AWS\n2. Enter the code\n3. Enjoy credits",
  claimUrl: "https://aws.amazon.com/activate",
  claimCode: "THUB2024",
  validUntil: "2027-12-31",
  expired: false,
};

describe("BenefitDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders benefit details", async () => {
    mockGetBenefit.mockResolvedValue(mockBenefit);

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("$5,000 in AWS credits")).toBeInTheDocument();
    });

    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  it("shows what you get section", async () => {
    mockGetBenefit.mockResolvedValue(mockBenefit);

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("WHAT YOU GET")).toBeInTheDocument();
    });

    expect(screen.getByText("Credits for cloud computing services")).toBeInTheDocument();
  });

  it("shows eligibility section", async () => {
    mockGetBenefit.mockResolvedValue(mockBenefit);

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("ELIGIBILITY")).toBeInTheDocument();
    });

    expect(screen.getByText("Must be a T-Hub startup")).toBeInTheDocument();
  });

  it("shows how to claim section", async () => {
    mockGetBenefit.mockResolvedValue(mockBenefit);

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("HOW TO CLAIM")).toBeInTheDocument();
    });
  });

  it("shows claim action with reveal button", async () => {
    mockGetBenefit.mockResolvedValue(mockBenefit);

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Ready to claim?")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Reveal" })).toBeInTheDocument();
  });

  it("reveals code on click", async () => {
    const user = userEvent.setup();
    mockGetBenefit.mockResolvedValue(mockBenefit);

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Reveal" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Reveal" }));

    expect(screen.getByText("THUB2024")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  it("shows 404 when benefit not found", async () => {
    mockGetBenefit.mockResolvedValue(null);

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Benefit Not Found")).toBeInTheDocument();
    });
  });

  it("shows expired indicator for past dates", async () => {
    mockGetBenefit.mockResolvedValue({
      ...mockBenefit,
      validUntil: "2020-01-01",
    });

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Expired")).toBeInTheDocument();
    });

    // Should not show claim section when expired
    expect(screen.queryByText("Ready to claim?")).not.toBeInTheDocument();
  });

  it("shows claim link when available", async () => {
    mockGetBenefit.mockResolvedValue(mockBenefit);

    render(<BenefitDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /claim this offer/i })).toHaveAttribute(
        "href",
        "https://aws.amazon.com/activate"
      );
    });
  });
});
