// In-memory progress tracking for file processing
interface ProcessingProgress {
    fileId: string;
    stage: 'starting' | 'processing' | 'looking-up' | 'saving' | 'complete' | 'error';
    currentWord: number;
    totalWords: number;
    message: string;
    startTime: number;
}

// Use global to ensure single instance across Next.js module reloads
const globalForProgress = global as unknown as {
    progressMap: Map<string, ProcessingProgress> | undefined;
};

const progressMap = globalForProgress.progressMap ?? new Map<string, ProcessingProgress>();
globalForProgress.progressMap = progressMap;

export class ProgressTracker {
    /**
     * Initialize progress tracking for a file
     */
    static start(fileId: string, totalWords: number): void {
        progressMap.set(fileId, {
            fileId,
            stage: 'starting',
            currentWord: 0,
            totalWords,
            message: 'Starting vocabulary extraction...',
            startTime: Date.now(),
        });
        console.log(`📊 Progress tracking started for ${fileId}: ${totalWords} words`);
    }

    /**
     * Update progress
     */
    static update(
        fileId: string,
        stage: ProcessingProgress['stage'],
        currentWord: number,
        message: string
    ): void {
        const progress = progressMap.get(fileId);
        if (progress) {
            progress.stage = stage;
            progress.currentWord = currentWord;
            progress.message = message;
            progressMap.set(fileId, progress);

            // Log every 10 words
            if (currentWord % 10 === 0) {
                console.log(`📊 Progress: ${currentWord}/${progress.totalWords} (${this.getPercentage(fileId)}%)`);
            }
        }
    }

    /**
     * Mark as complete
     */
    static complete(fileId: string, wordCount: number): void {
        const progress = progressMap.get(fileId);
        if (progress) {
            progress.stage = 'complete';
            progress.currentWord = progress.totalWords;
            progress.message = `Complete! Added ${wordCount} words to vocabulary.`;
            progressMap.set(fileId, progress);

            console.log(`✅ Progress complete for ${fileId}: ${wordCount} words saved`);

            // Remove from map after 30 seconds
            setTimeout(() => {
                progressMap.delete(fileId);
            }, 30000);
        }
    }

    /**
     * Mark as error
     */
    static error(fileId: string, errorMessage: string): void {
        const progress = progressMap.get(fileId);
        if (progress) {
            progress.stage = 'error';
            progress.message = `Error: ${errorMessage}`;
            progressMap.set(fileId, progress);

            // Remove from map after 60 seconds
            setTimeout(() => {
                progressMap.delete(fileId);
            }, 60000);
        }
    }

    /**
     * Get progress for a file
     */
    static get(fileId: string): ProcessingProgress | null {
        const progress = progressMap.get(fileId) || null;
        if (progress) {
            console.log(`📊 ProgressTracker.get(${fileId}) found:`, {
                stage: progress.stage,
                currentWord: progress.currentWord,
                totalWords: progress.totalWords,
            });
        } else {
            console.log(`⚠️ ProgressTracker.get(${fileId}) returned null. Map size: ${progressMap.size}`);
        }
        return progress;
    }

    /**
     * Get percentage complete based on word progress
     */
    static getPercentage(fileId: string): number {
        const progress = progressMap.get(fileId);
        if (!progress) return 0;

        if (progress.stage === 'complete') return 100;
        if (progress.totalWords === 0) return 0;

        // Calculate percentage based on words processed
        const percentage = Math.round((progress.currentWord / progress.totalWords) * 100);
        return Math.min(percentage, 99); // Cap at 99% until complete
    }

    /**
     * Check if still processing
     */
    static isProcessing(fileId: string): boolean {
        const progress = progressMap.get(fileId);
        return progress ? progress.stage !== 'complete' && progress.stage !== 'error' : false;
    }
}

