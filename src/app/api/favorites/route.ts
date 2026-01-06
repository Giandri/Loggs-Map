import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET /api/favorites - Get user's favorites from cookies
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("coffee-session-id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Session not found. Please refresh the page." }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId,
      },
      include: {
        coffeeShop: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return only coffee shop IDs for simplicity
    const favoriteIds = favorites.map((fav) => fav.coffeeShopId);

    return NextResponse.json({ favorites: favoriteIds });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/favorites - Add favorite
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("coffee-session-id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Session not found. Please refresh the page." }, { status: 401 });
    }

    const body = await request.json();
    const { coffeeShopId } = body;

    if (!coffeeShopId) {
      return NextResponse.json({ error: "coffeeShopId is required" }, { status: 400 });
    }

    // Check if coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: coffeeShopId },
    });

    if (!coffeeShop) {
      return NextResponse.json({ error: "Coffee shop not found" }, { status: 404 });
    }

    // Create favorite (will fail if already exists due to unique constraint)
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        coffeeShopId,
      },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating favorite:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Favorite already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/favorites?coffeeShopId=<coffeeShopId> - Remove favorite
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("coffee-session-id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Session not found. Please refresh the page." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const coffeeShopId = searchParams.get("coffeeShopId");

    if (!coffeeShopId) {
      return NextResponse.json({ error: "coffeeShopId is required" }, { status: 400 });
    }

    const favorite = await prisma.favorite.deleteMany({
      where: {
        userId: userId,
        coffeeShopId: coffeeShopId,
      },
    });

    if (favorite.count === 0) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
