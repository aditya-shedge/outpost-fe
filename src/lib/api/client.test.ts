import { ApiClientError } from "./client";

describe("ApiClientError", () => {
  it("should create error with correct properties", () => {
    const error = new ApiClientError({
      status: 400,
      error: "Bad Request",
      code: "VALIDATION_ERROR",
      message: "Email is required",
      errors: [{ field: "email", message: "must not be blank" }],
    });

    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Email is required");
    expect(error.errors).toEqual([{ field: "email", message: "must not be blank" }]);
    expect(error.name).toBe("ApiClientError");
  });

  it("should be instanceof Error", () => {
    const error = new ApiClientError({
      status: 401,
      error: "Unauthorized",
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiClientError);
  });
});

describe("Token Storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get access token from localStorage", async () => {
    const { getAccessToken } = await import("@/lib/auth/storage");
    
    (localStorage.getItem as jest.Mock).mockReturnValue("test-token");
    
    const token = getAccessToken();
    
    expect(localStorage.getItem).toHaveBeenCalledWith("outpost_access_token");
    expect(token).toBe("test-token");
  });

  it("should return null when no token exists", async () => {
    const { getAccessToken } = await import("@/lib/auth/storage");
    
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    const token = getAccessToken();
    
    expect(token).toBeNull();
  });
});
