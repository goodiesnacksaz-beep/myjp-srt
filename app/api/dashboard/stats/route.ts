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

        // Get total files
        const totalFiles = await prisma.subtitleFile.count({
            where: {
                userId: session.user.id,
            },
        });

        // Get total vocabulary words
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
        });

        const totalWords = files.reduce(
            (sum, file) => sum + file.vocabulary.length,
            0
        );

        // Get quiz attempts
        const quizAttempts = await prisma.quizAttempt.findMany({
            where: {
                userId: session.user.id,
            },
        });

        const quizzesTaken = quizAttempts.length;

        // Calculate average accuracy
        const totalScore = quizAttempts.reduce(
            (sum, attempt) => sum + attempt.score,
            0
        );
        const totalQuestions = quizAttempts.reduce(
            (sum, attempt) => sum + attempt.totalWords,
            0
        );

        const averageAccuracy =
            totalQuestions > 0
                ? Math.round((totalScore / totalQuestions) * 100)
                : 0;

        // Get recent quiz attempts
        const recentQuizzes = await prisma.quizAttempt.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                completedAt: "desc",
            },
            take: 5,
        });

        return NextResponse.json({
            totalFiles,
            totalWords,
            quizzesTaken,
            averageAccuracy,
            recentQuizzes,
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}

