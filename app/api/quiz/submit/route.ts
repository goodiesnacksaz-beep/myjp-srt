import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { fileId, answers, score, totalQuestions } = await req.json();

        if (!fileId || !answers) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create quiz attempt record
        const quizAttempt = await prisma.quizAttempt.create({
            data: {
                userId: session.user.id,
                fileId,
                score,
                totalWords: totalQuestions,
            },
        });

        // Update quiz items statistics
        for (const answer of answers) {
            const { vocabularyId, isCorrect } = answer;

            const existingQuizItem = await prisma.quizItem.findFirst({
                where: {
                    vocabularyId,
                },
            });

            if (existingQuizItem) {
                await prisma.quizItem.update({
                    where: {
                        id: existingQuizItem.id,
                    },
                    data: {
                        attempts: existingQuizItem.attempts + 1,
                        correct: isCorrect
                            ? existingQuizItem.correct + 1
                            : existingQuizItem.correct,
                        lastReviewed: new Date(),
                    },
                });
            } else {
                await prisma.quizItem.create({
                    data: {
                        vocabularyId,
                        attempts: 1,
                        correct: isCorrect ? 1 : 0,
                        lastReviewed: new Date(),
                    },
                });
            }
        }

        return NextResponse.json({
            message: "Quiz results saved successfully",
            quizAttemptId: quizAttempt.id,
        });
    } catch (error) {
        console.error("Quiz submission error:", error);
        return NextResponse.json(
            { error: "Failed to save quiz results" },
            { status: 500 }
        );
    }
}

