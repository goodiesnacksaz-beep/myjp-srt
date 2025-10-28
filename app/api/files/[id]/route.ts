import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
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

        const file = await prisma.subtitleFile.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
            include: {
                vocabulary: {
                    orderBy: {
                        frequency: "desc",
                    },
                },
            },
        });

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        return NextResponse.json({ file });
    } catch (error) {
        console.error("Error fetching file:", error);
        return NextResponse.json(
            { error: "Failed to fetch file" },
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

        const file = await prisma.subtitleFile.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        });

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        await prisma.subtitleFile.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}

