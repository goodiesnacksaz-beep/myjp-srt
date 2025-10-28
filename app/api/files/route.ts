import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const files = await prisma.subtitleFile.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                vocabulary: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: {
                uploadDate: "desc",
            },
        });

        const filesWithCount = files.map(file => ({
            id: file.id,
            filename: file.filename,
            uploadDate: file.uploadDate,
            fileSize: file.fileSize,
            vocabularyCount: file.vocabulary.length,
        }));

        return NextResponse.json({ files: filesWithCount });
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json(
            { error: "Failed to fetch files" },
            { status: 500 }
        );
    }
}

