import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BenefitsPage from "./page";
import * as benefitsApi from "@/lib/api/benefits";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the API
jest.mock("@/lib/api/benefits");
const mockGetBenefits = benefitsApi.getBenefits as jest.MockedFunction<typeof benefitsApi.getBenefits>;
const mockGetFeaturedPartners = benefitsApi.getFeaturedPartners as jest.MockedFunction<typeof benefitsApi.getFeaturedPartners>;
const mockGetPartners = benefitsApi.getPartners as jest.MockedFunction<typeof benefitsApi.getPartners>;

const mockBenefits: benefitsApi.Benefit[] = [
  {
    id: "benefit-1",
    partnerId: "partner-1",
    partnerName: "AWS",
    headline: "$5,000 in AWS credits",
    category: "CLOUD",
    whatYouGet: "Credits for cloud services",
    validUntil: "2027-12-31",
  },
  {
    id: "benefit-2",
    partnerId: "partner-2",
    partnerName: "Notion",
    headline: "Free Notion Plus",
    category: "BUSINESS_TOOLS",
    whatYouGet: "Unlimited blocks and members",
    validUntil: "2027-06-30",
  },
];

const mockPartners: benefitsApi.Partner[] = [
  { id: "partner-1", name: "AWS", featured: true },
  { id: "partner-2", name: "Notion", featured: true },
];

describe("BenefitsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBenefits.mockResolvedValue({
      content: mockBenefits,
      page: { number: 0, size: 12, totalElements: 2, totalPages: 1 },
    });
    mockGetFeaturedPartners.mockResolvedValue(mockPartners);
    mockGetPartners.mockResolvedValue(mockPartners);
  });

  it("renders benefits listing", async () => {
    render(<BenefitsPage />);

    await waitFor(() => {
      expect(screen.getByText("$5,000 in AWS credits")).toBeInTheDocument();
    });

    expect(screen.getByText("Free Notion Plus")).toBeInTheDocument();
  });

  it("shows featured partners section", async () => {
    render(<BenefitsPage />);

    await waitFor(() => {
      expect(screen.getByText("FEATURED PARTNERS")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /aws/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /notion/i })).toBeInTheDocument();
  });

  it("displays results count", async () => {
    render(<BenefitsPage />);

    await waitFor(() => {
      expect(screen.getByText("2 benefits found")).toBeInTheDocument();
    });
  });

  it("shows empty state when no benefits", async () => {
    mockGetBenefits.mockResolvedValue({
      content: [],
      page: { number: 0, size: 12, totalElements: 0, totalPages: 0 },
    });

    render(<BenefitsPage />);

    await waitFor(() => {
      expect(screen.getByText("No benefits found")).toBeInTheDocument();
    });
  });

  it("has show expired toggle", async () => {
    render(<BenefitsPage />);

    await waitFor(() => {
      expect(screen.getByText("Show expired")).toBeInTheDocument();
    });
  });

  it("has AI recommendations toggle", async () => {
    render(<BenefitsPage />);

    await waitFor(() => {
      expect(screen.getByText("AI recommendations")).toBeInTheDocument();
    });
  });

  it("has category filter dropdown", async () => {
    render(<BenefitsPage />);

    await waitFor(() => {
      expect(screen.getByText("All categories")).toBeInTheDocument();
    });
  });
});
