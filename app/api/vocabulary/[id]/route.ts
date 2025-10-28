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
        const { word, reading, meaning } = body;

        // Validate input
        if (!word || !reading || !meaning) {
            return NextResponse.json(
                { error: "Word, reading, and meaning are required" },
                { status: 400 }
            );
        }

        // Find the vocabulary item
        const vocabulary = await prisma.vocabulary.findUnique({
            where: { id },
            include: {
                file: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!vocabulary) {
            return NextResponse.json(
                { error: "Vocabulary item not found" },
                { status: 404 }
            );
        }

        // Verify the vocabulary belongs to the user's file
        if (vocabulary.file.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Update the vocabulary item
        const updated = await prisma.vocabulary.update({
            where: { id },
            data: {
                word: word.trim(),
                reading: reading.trim(),
                meaning: meaning.trim(),
            },
        });

        console.log(`✏️ Updated vocabulary item: ${updated.word} (${id})`);

        return NextResponse.json({
            success: true,
            message: "Vocabulary item updated successfully",
            vocabulary: updated,
        });
    } catch (error) {
        console.error("Error updating vocabulary:", error);
        return NextResponse.json(
            { error: "Failed to update vocabulary item" },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        // Find the vocabulary item
        const vocabulary = await prisma.vocabulary.findUnique({
            where: { id },
            include: {
                file: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!vocabulary) {
            return NextResponse.json(
                { error: "Vocabulary item not found" },
                { status: 404 }
            );
        }

        // Verify the vocabulary belongs to the user's file
        if (vocabulary.file.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Delete the vocabulary item
        await prisma.vocabulary.delete({
            where: { id },
        });

        console.log(`🗑️ Deleted vocabulary item: ${vocabulary.word} (${id})`);

        return NextResponse.json({
            success: true,
            message: "Vocabulary item deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting vocabulary:", error);
        return NextResponse.json(
            { error: "Failed to delete vocabulary item" },
            { status: 500 }
        );
    }
}

