import { describe, it, expect, vi } from "vitest";
import { GET, POST, PATCH, DELETE } from "../../app/api/artworks/route";

// Mock Next.js cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: "mock-session-token" })),
  })),
}));

// Mock Vercel blob operations
vi.mock("@vercel/blob", () => ({
  put: vi.fn(() =>
    Promise.resolve({ url: "https://mock-blob-url.com/image.jpg" }),
  ),
  del: vi.fn(() => Promise.resolve()),
}));

// Mock auth check to always pass for testing
vi.mock("@/lib/auth", () => ({
  checkCookieHeader: vi.fn(() => Promise.resolve(true)),
  validateSessionToken: vi.fn(() =>
    Promise.resolve({
      session: { id: "test-session", userId: 1, expiresAt: new Date() },
    }),
  ),
  generateSessionToken: vi.fn(() => "mock-token"),
}));

describe("GET /api/artworks", () => {
  it("should return all active artworks when no query params", async () => {
    const request = new Request("http://localhost:3000/api/artworks");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(4); // 4 active artworks in seed data
    expect(data.every((artwork: any) => artwork.is_active === true)).toBe(true);
  });

  it("should return a single artwork by id", async () => {
    const request = new Request("http://localhost:3000/api/artworks?id=1");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(1);
    expect(data.title).toBe("Sunset Over Mountains");
    expect(data.media).toBe("oil on canvas");
  });

  it("should return artworks filtered by category", async () => {
    const request = new Request(
      "http://localhost:3000/api/artworks?category=Portrait",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].category_name).toBe("Portrait");
  });

  it("should return artworks filtered by tag", async () => {
    const request = new Request(
      "http://localhost:3000/api/artworks?tag=exemplar",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2); // Sunset and Abstract are exemplars
  });

  it("should return artworks matching search term", async () => {
    const request = new Request(
      "http://localhost:3000/api/artworks?search=pencil",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((artwork: any) => artwork.media === "pencil")).toBe(true);
  });

  it("should return recent artworks (last 5 years)", async () => {
    const request = new Request(
      "http://localhost:3000/api/artworks?recent=true",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    const currentYear = new Date().getFullYear();
    expect(data.every((artwork: any) => artwork.year >= currentYear - 5)).toBe(
      true,
    );
  });

  it("should return exemplar artworks", async () => {
    const request = new Request(
      "http://localhost:3000/api/artworks?exemplars=true",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2); // 2 artworks tagged as exemplar
  });
});

describe("POST /api/artworks", () => {
  it("should create a new artwork without images", async () => {
    const formData = new FormData();
    formData.append("title", "New Test Artwork");
    formData.append("media", "oil on canvas");
    formData.append("category_name", "Landscape");
    formData.append("year", "2025");
    formData.append("width", "20");
    formData.append("height", "16");
    formData.append("price", "450.00");

    const request = new Request("http://localhost:3000/api/artworks", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(typeof data.id).toBe("number");
  });

  it("should create a new artwork with tags", async () => {
    const formData = new FormData();
    formData.append("title", "Tagged Artwork");
    formData.append("media", "charcoal");
    formData.append("category_name", "Drawings");
    formData.append("tags", "featured");
    formData.append("tags", "modern");

    const request = new Request("http://localhost:3000/api/artworks", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
  });
});

describe("PATCH /api/artworks", () => {
  it("should update artwork fields", async () => {
    const formData = new FormData();
    formData.append("id", "1");
    formData.append("title", "Updated Sunset Title");
    formData.append("price", "600.00");

    const request = new Request("http://localhost:3000/api/artworks", {
      method: "PATCH",
      body: formData,
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe("Updated Sunset Title");
    expect(parseFloat(data.price)).toBe(600.0);
  });

  it("should update artwork tags", async () => {
    const formData = new FormData();
    formData.append("id", "3");
    formData.append("tags", "featured");
    formData.append("tags", "classic");

    const request = new Request("http://localhost:3000/api/artworks", {
      method: "PATCH",
      body: formData,
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(3);
  });

  it("should return 401 if not authorized", async () => {
    // Temporarily mock auth to fail
    const { checkCookieHeader } = await import("@/lib/auth");
    vi.mocked(checkCookieHeader).mockResolvedValueOnce(false);

    const formData = new FormData();
    formData.append("id", "1");
    formData.append("title", "Should Fail");

    const request = new Request("http://localhost:3000/api/artworks", {
      method: "PATCH",
      body: formData,
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Not authorized");
  });
});

describe("DELETE /api/artworks", () => {
  it("should delete an artwork by id", async () => {
    // First verify the artwork exists
    const checkRequest = new Request("http://localhost:3000/api/artworks?id=4");
    const checkResponse = await GET(checkRequest);
    const artwork = await checkResponse.json();
    expect(artwork).toBeDefined();
    expect(artwork.id).toBe(4);

    // Now delete it
    const request = new Request("http://localhost:3000/api/artworks?id=4", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    expect(response.status).toBe(200);

    // Verify it's deleted
    const getRequest = new Request("http://localhost:3000/api/artworks?id=4");
    const getResponse = await GET(getRequest);
    expect(getResponse.status).toBe(404);
  });

  it("should return 401 if not authorized", async () => {
    const { checkCookieHeader } = await import("@/lib/auth");
    vi.mocked(checkCookieHeader).mockResolvedValueOnce(false);

    const request = new Request("http://localhost:3000/api/artworks?id=1", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Not authorized");
  });
});
