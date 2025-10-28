import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        // Get total cache count
        const totalWords = await prisma.dictionaryCache.count();

        // Get recent words
        const recentWords = await prisma.dictionaryCache.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                word: true,
                meaning: true,
                createdAt: true,
            },
        });

        // Get oldest words
        const oldestWords = await prisma.dictionaryCache.findMany({
            take: 5,
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                word: true,
                meaning: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            totalWords,
            recentWords,
            oldestWords,
            cacheAge: oldestWords[0]?.createdAt,
        });
    } catch (error) {
        console.error("Error fetching cache stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch cache statistics" },
            { status: 500 }
        );
    }
}

