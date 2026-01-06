import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/coffee-shops - Get all coffee shops
export async function GET(request: NextRequest) {
  try {
    const coffeeShops = await prisma.coffeeShop.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(coffeeShops);
  } catch (error) {
    console.error("Error fetching coffee shops:", error);
    return NextResponse.json({ error: "Failed to fetch coffee shops" }, { status: 500 });
  }
}

// POST /api/coffee-shops - Create a new coffee shop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const coffeeShop = await prisma.coffeeShop.create({
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
        videoUrl: body.videoUrl,
        videoPlatform: body.videoPlatform,
      },
    });

    return NextResponse.json(coffeeShop, { status: 201 });
  } catch (error) {
    console.error("Error creating coffee shop:", error);
    return NextResponse.json({ error: "Failed to create coffee shop" }, { status: 500 });
  }
}
