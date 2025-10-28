import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressTracker } from "@/lib/progress-tracker";
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

        // Verify file belongs to user
        const file = await prisma.subtitleFile.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
            include: {
                vocabulary: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // Get progress
        const progress = ProgressTracker.get(id);
        const percentage = ProgressTracker.getPercentage(id);
        const isProcessing = ProgressTracker.isProcessing(id);

        // If not processing and has vocabulary, it's complete
        const isComplete = !isProcessing && file.vocabulary.length > 0;

        console.log(`📊 Progress API for ${id}:`, {
            hasProgress: !!progress,
            percentage,
            isProcessing,
            vocabularyCount: file.vocabulary.length,
            stage: progress?.stage,
            currentWord: progress?.currentWord,
            totalWords: progress?.totalWords,
        });

        return NextResponse.json({
            isProcessing: isProcessing || (file.vocabulary.length === 0 && !progress),
            isComplete,
            percentage,
            vocabularyCount: file.vocabulary.length,
            progress: progress ? {
                stage: progress.stage,
                message: progress.message,
                currentWord: progress.currentWord,
                totalWords: progress.totalWords,
            } : null,
        });
    } catch (error) {
        console.error("Error fetching progress:", error);
        return NextResponse.json(
            { error: "Failed to fetch progress" },
            { status: 500 }
        );
    }
}

