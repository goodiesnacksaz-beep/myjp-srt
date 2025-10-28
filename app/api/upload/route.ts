import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SRTParser } from "@/lib/srt-parser";
import { VocabularyExtractor } from "@/lib/vocabulary-extractor";
import { ProgressTracker } from "@/lib/progress-tracker";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file size (5MB max)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size exceeds 5MB limit" },
                { status: 400 }
            );
        }

        // Validate file extension
        if (!file.name.endsWith(".srt")) {
            return NextResponse.json(
                { error: "Invalid file format. Only .srt files are supported" },
                { status: 400 }
            );
        }

        // Read file content
        const content = await file.text();

        // Validate SRT format
        const validation = SRTParser.validate(content);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Parse SRT file
        const entries = SRTParser.parse(content);

        // Create file record
        const subtitleFile = await prisma.subtitleFile.create({
            data: {
                filename: file.name,
                fileSize: file.size,
                userId: session.user.id,
            },
        });

        // Initialize progress tracking (will be updated with actual word count later)
        console.log(`📊 Starting progress tracking for file: ${subtitleFile.id}`);
        ProgressTracker.start(subtitleFile.id, 100); // Estimated word count

        // Extract vocabulary in background (async)
        console.log(`🚀 Launching background extraction for file: ${subtitleFile.id}`);
        processVocabularyExtraction(subtitleFile.id, entries);

        return NextResponse.json(
            {
                success: true,
                fileId: subtitleFile.id,
                filename: file.name,
                message: "File uploaded successfully. Vocabulary extraction in progress.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

/**
 * Process vocabulary extraction asynchronously
 */
async function processVocabularyExtraction(
    fileId: string,
    entries: any[]
) {
    try {
        console.log(`📝 processVocabularyExtraction called with fileId: ${fileId}`);
        console.log(`Starting vocabulary extraction for file ${fileId} with ${entries.length} entries`);

        ProgressTracker.update(fileId, 'processing', 0, 'Analyzing Japanese text...');
        console.log(`📊 Updated progress to 'processing' stage for ${fileId}`);

        console.log(`🔧 About to call VocabularyExtractor.extractFromSubtitles...`);
        
        const vocabulary = await VocabularyExtractor.extractFromSubtitles(
            entries,
            2, // minimum frequency
            fileId // pass fileId for progress tracking
        );

        console.log(`✅ Vocabulary extraction complete for ${fileId}, found ${vocabulary.length} words`);

        if (vocabulary.length === 0) {
            console.warn(`⚠️ No vocabulary extracted from file ${fileId}! Entries: ${entries.length}`);
        }

        console.log(`Extracted ${vocabulary.length} vocabulary words, saving to database...`);

        ProgressTracker.update(fileId, 'saving', vocabulary.length, 'Saving vocabulary to database...');

        // Batch insert for better performance
        if (vocabulary.length > 0) {
            await prisma.vocabulary.createMany({
                data: vocabulary.map(vocab => ({
                    fileId,
                    word: vocab.word,
                    reading: vocab.reading,
                    meaning: vocab.meaning,
                    contextSentence: vocab.contextSentence,
                    frequency: vocab.frequency,
                })),
            });
            console.log(`💾 Successfully saved ${vocabulary.length} vocabulary items to database`);
        } else {
            console.warn(`⚠️ No vocabulary to save for file ${fileId}`);
        }

        console.log(`Vocabulary extraction completed for file ${fileId}: ${vocabulary.length} words saved`);

        // Mark as complete
        ProgressTracker.complete(fileId, vocabulary.length);

    } catch (error) {
        console.error(`❌ Vocabulary extraction error for file ${fileId}:`, error);

        if (error instanceof Error) {
            console.error(`Error name: ${error.name}`);
            console.error(`Error message: ${error.message}`);
            console.error(`Error stack: ${error.stack}`);
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        ProgressTracker.error(fileId, errorMessage);
    }
}

