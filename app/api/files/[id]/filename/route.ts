import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Await params (Next.js 15 requirement)
        const { id } = await params;
        const body = await req.json();
        const { filename } = body;

        // Validate input
        if (!filename || !filename.trim()) {
            return NextResponse.json(
                { error: "Filename is required" },
                { status: 400 }
            );
        }

        // Ensure filename ends with .srt
        const trimmedFilename = filename.trim();
        const finalFilename = trimmedFilename.endsWith('.srt')
            ? trimmedFilename
            : `${trimmedFilename}.srt`;

        // Find the file
        const file = await prisma.subtitleFile.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!file) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            );
        }

        // Verify the file belongs to the user
        if (file.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Update the filename
        const updated = await prisma.subtitleFile.update({
            where: { id },
            data: {
                filename: finalFilename,
            },
        });

        console.log(`✏️ Updated filename: ${updated.filename} (${id})`);

        return NextResponse.json({
            success: true,
            message: "Filename updated successfully",
            filename: updated.filename,
        });
    } catch (error) {
        console.error("Error updating filename:", error);
        return NextResponse.json(
            { error: "Failed to update filename" },
            { status: 500 }
        );
    }
}

