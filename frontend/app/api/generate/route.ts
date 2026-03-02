import { NextRequest, NextResponse } from "next/server";

interface GenerationRequest {
  description: string;
}

interface GeneratedBackend {
  id: string;
  description: string;
  endpoints: string[];
  dashboardUrl: string;
  createdAt: string;
}

// Mock endpoint for demonstration
// In production, this would call your actual backend service
export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { description } = body;

    if (!description || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    // Call your backend generator API
    // Example: const response = await fetch("http://localhost:3000/api/generate", { ... })

    // For now, return mock data with realistic endpoints based on description
    const mockId = Math.random().toString(36).substring(7);
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`;

    // Parse description to generate relevant endpoints
    const lowerDesc = description.toLowerCase();
    const endpoints: string[] = [];

    // Common CRUD endpoints
    if (lowerDesc.includes("get") || lowerDesc.includes("read") || lowerDesc.includes("list")) {
      endpoints.push("GET /api/items - Retrieve all items");
      endpoints.push("GET /api/items/:id - Retrieve item by ID");
    }

    if (lowerDesc.includes("create") || lowerDesc.includes("add")) {
      endpoints.push("POST /api/items - Create new item");
    }

    if (lowerDesc.includes("update") || lowerDesc.includes("edit")) {
      endpoints.push("PUT /api/items/:id - Update item");
      endpoints.push("PATCH /api/items/:id - Partially update item");
    }

    if (lowerDesc.includes("delete") || lowerDesc.includes("remove")) {
      endpoints.push("DELETE /api/items/:id - Delete item");
    }

    // Authentication endpoints
    if (lowerDesc.includes("auth") || lowerDesc.includes("login") || lowerDesc.includes("user")) {
      endpoints.push("POST /api/auth/register - Register new user");
      endpoints.push("POST /api/auth/login - User login");
      endpoints.push("POST /api/auth/logout - User logout");
      endpoints.push("GET /api/auth/profile - Get user profile");
    }

    // Default endpoints if none matched
    if (endpoints.length === 0) {
      endpoints.push("GET /api/health - Health check");
      endpoints.push("POST /api/data - Create data");
      endpoints.push("GET /api/data - Retrieve data");
    }

    const generated: GeneratedBackend = {
      id: mockId,
      description,
      endpoints,
      dashboardUrl: `${baseUrl}/dashboard/${mockId}`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(generated, { status: 200 });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate backend" },
      { status: 500 }
    );
  }
}
