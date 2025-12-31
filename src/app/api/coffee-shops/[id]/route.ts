import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

// GET /api/coffee-shops/[id] - Get a single coffee shop
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: {
        id: id,
      },
    });

    if (!coffeeShop) {
      return new Response(JSON.stringify({ error: "Coffee shop not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(coffeeShop), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching coffee shop:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch coffee shop" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT /api/coffee-shops/[id] - Update a coffee shop
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const coffeeShop = await prisma.coffeeShop.update({
      where: {
        id: id,
      },
      data: {
        name: body.name,
        address: body.address,
        lat: body.lat,
        lng: body.lng,
        whatsapp: body.whatsapp,
        instagram: body.instagram,
        facilities: body.facilities,
        photos: body.photos,
        logo: body.logo,
        wfc: body.wfc,
        openTime: body.openTime,
        closeTime: body.closeTime,
        operatingDays: body.operatingDays,
        priceRange: body.priceRange,
        serviceTax: body.serviceTax,
        connectionSpeed: body.connectionSpeed,
        mushola: body.mushola,
        parking: body.parking,
        paymentMethods: body.paymentMethods,
      },
    });

    return new Response(JSON.stringify(coffeeShop), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error updating coffee shop:", error);

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return new Response(JSON.stringify({ error: "Coffee shop not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to update coffee shop" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE /api/coffee-shops/[id] - Delete a coffee shop
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Coffee shop ID is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get coffee shop data first to retrieve photo and logo URLs
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id },
    });

    if (!coffeeShop) {
      return new Response(JSON.stringify({
        error: "Coffee shop not found",
        details: "The coffee shop with the specified ID does not exist"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete photos from Vercel Blob
    const photosToDelete: string[] = [];
    
    // Add photos URLs (only Vercel Blob URLs, not placeholders)
    if (coffeeShop.photos && Array.isArray(coffeeShop.photos)) {
      const photos = coffeeShop.photos as string[];
      photos.forEach((url: string) => {
        if (url && url.includes('blob.vercel-storage.com')) {
          photosToDelete.push(url);
        }
      });
    }

    // Add logo URL if it's a Vercel Blob URL
    if (coffeeShop.logo && coffeeShop.logo.includes('blob.vercel-storage.com')) {
      photosToDelete.push(coffeeShop.logo);
    }

    // Delete all blobs
    if (photosToDelete.length > 0) {
      console.log("Deleting blobs:", photosToDelete);
      try {
        await del(photosToDelete);
        console.log("Blobs deleted successfully");
      } catch (blobError) {
        console.warn("Failed to delete some blobs:", blobError);
        // Continue with database deletion even if blob deletion fails
      }
    }

    // Delete from database
    await prisma.coffeeShop.delete({
      where: { id },
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Coffee shop deleted successfully",
      deletedId: id,
      deletedBlobs: photosToDelete.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error deleting coffee shop:", error);

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === 'P2025') {
        return new Response(JSON.stringify({
          error: "Coffee shop not found",
          details: "The coffee shop with the specified ID does not exist"
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (prismaError.code === 'P1001') {
        return new Response(JSON.stringify({
          error: "Database connection error",
          details: "Unable to connect to database"
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      error: "Failed to delete coffee shop",
      details: error instanceof Error ? error.message : "An unknown error occurred"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
