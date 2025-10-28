import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QuizGenerator, QuizType } from "@/lib/quiz-generator";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { fileId, quizType, count } = await req.json();

        if (!fileId) {
            return NextResponse.json(
                { error: "File ID is required" },
                { status: 400 }
            );
        }

        // Verify file belongs to user
        const file = await prisma.subtitleFile.findFirst({
            where: {
                id: fileId,
                userId: session.user.id,
            },
            include: {
                vocabulary: true,
            },
        });

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        if (file.vocabulary.length === 0) {
            return NextResponse.json(
                { error: "No vocabulary found for this file. Processing may still be in progress." },
                { status: 400 }
            );
        }

        // Generate quiz
        const questions = quizType === "mixed"
            ? QuizGenerator.generateMixedQuiz(file.vocabulary, count || 10)
            : QuizGenerator.generateQuiz(
                file.vocabulary,
                quizType as QuizType,
                count || 10
            );

        return NextResponse.json({ questions });
    } catch (error) {
        console.error("Quiz generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate quiz" },
            { status: 500 }
        );
    }
}

