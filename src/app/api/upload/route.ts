import { put, list, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    console.log("Fetching Vercel Blob files...");

    const { blobs } = await list({
      limit,
    });

    console.log(`Found ${blobs.length} files`);

    // Format response
    const files = blobs.map((blob) => ({
      url: blob.url,
      name: blob.pathname.split("/").pop() || blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      pathname: blob.pathname,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get("pathname");

    if (!pathname) {
      return NextResponse.json({ error: "Pathname is required" }, { status: 400 });
    }

    console.log("Deleting file:", pathname);

    await del([pathname]);

    console.log("File deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Debug: Check if BLOB_READ_WRITE_TOKEN is available
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    console.log("BLOB_READ_WRITE_TOKEN available:", !!token);
    console.log("Token length:", token?.length);

    // Get file from request body
    const file = await request.blob();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Validate file type (check MIME type)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File must be an image (JPEG, PNG, WebP)" }, { status: 400 });
    }

    // Try to upload to Vercel Blob, fallback to placeholder if fails
    try {
      const blob = await put(filename, file, {
        access: "public",
      });

      console.log("Vercel Blob upload successful:", blob.url);
      return NextResponse.json(blob);
    } catch (blobError: unknown) {
      const message = blobError instanceof Error ? blobError.message : String(blobError);
      console.warn("Vercel Blob upload failed:", message);

      // Fallback: Return placeholder URL for development
      const placeholderUrl = `/api/placeholder/400/300?text=${encodeURIComponent(filename)}`;

      return NextResponse.json({
        url: placeholderUrl,
        size: file.size,
        name: filename,
        fallback: true, // Indicate this is a fallback
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
