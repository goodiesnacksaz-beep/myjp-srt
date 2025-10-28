import { JapaneseProcessor, Token } from "./japanese-processor";
import { SubtitleEntry } from "@/types";
import { Dictionary } from "./dictionary";

export interface ExtractedVocabulary {
    word: string;
    reading: string;
    meaning: string;
    contextSentence: string;
    frequency: number;
}

export class VocabularyExtractor {
    /**
     * Extract vocabulary from subtitle entries
     */
    static async extractFromSubtitles(
        entries: SubtitleEntry[],
        minFrequency: number = 2,
        fileId?: string
    ): Promise<ExtractedVocabulary[]> {
        const vocabularyMap = new Map<string, {
            reading: string;
            contexts: string[];
            frequency: number;
        }>();

        console.log(`Processing ${entries.length} subtitle entries...`);

        // Process each subtitle entry
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];

            if (i % 50 === 0) {
                console.log(`Processed ${i}/${entries.length} entries...`);
            }

            try {
                const tokens = await JapaneseProcessor.tokenize(entry.text);
                const filteredTokens = JapaneseProcessor.filterVocabulary(tokens);

                for (const token of filteredTokens) {
                    const word = token.baseForm;
                    const reading = JapaneseProcessor.getHiraganaReading(token.reading);

                    if (vocabularyMap.has(word)) {
                        const existing = vocabularyMap.get(word)!;
                        existing.frequency++;
                        if (existing.contexts.length < 5) {
                            existing.contexts.push(entry.text);
                        }
                    } else {
                        vocabularyMap.set(word, {
                            reading,
                            contexts: [entry.text],
                            frequency: 1,
                        });
                    }
                }
            } catch (error) {
                console.error(`Error processing entry ${i}:`, entry.text, error);
                // Continue processing other entries
            }
        }

        console.log(`Found ${vocabularyMap.size} unique words before filtering`);


        // Filter by minimum frequency
        const frequentWords = Array.from(vocabularyMap.entries())
            .filter(([_, data]) => data.frequency >= minFrequency)
            .sort((a, b) => b[1].frequency - a[1].frequency);

        console.log(`${frequentWords.length} words meet minimum frequency of ${minFrequency}`);

        // Look up meanings using Jisho API with caching
        const vocabulary: ExtractedVocabulary[] = [];

        // Limit to 100 words to avoid too many API calls
        const wordsToProcess = frequentWords.slice(0, 100);
        console.log(`Looking up meanings for ${wordsToProcess.length} words using Jisho API...`);

        // Update progress tracker with actual word count
        if (fileId) {
            const { ProgressTracker } = await import("./progress-tracker");
            // Reset progress with actual word count
            console.log(`🔄 Resetting progress tracker for ${fileId} with ${wordsToProcess.length} words`);
            ProgressTracker.start(fileId, wordsToProcess.length);
        } else {
            console.warn("⚠️ No fileId provided - progress tracking disabled");
        }

        // Initialize dictionary once
        await Dictionary.initialize();

        for (let i = 0; i < wordsToProcess.length; i++) {
            const [word, data] = wordsToProcess[i];

            // Update progress for every word
            if (fileId) {
                const { ProgressTracker } = await import("./progress-tracker");
                ProgressTracker.update(
                    fileId,
                    'looking-up',
                    i + 1,
                    `Looking up: "${word}" (${i + 1}/${wordsToProcess.length})`
                );

                // Log first few updates for debugging
                if (i < 5) {
                    console.log(`📊 Updated progress: ${i + 1}/${wordsToProcess.length} for ${fileId}`);
                }
            }

            try {
                // Dictionary lookup via API
                const meaning = await Dictionary.lookup(word);

                // Only add to vocabulary if translation was found
                if (meaning && meaning !== "Translation not found") {
                    vocabulary.push({
                        word,
                        reading: data.reading,
                        meaning: meaning,
                        contextSentence: data.contexts[0],
                        frequency: data.frequency,
                    });
                } else {
                    console.log(`⚠️ Skipping "${word}" - no translation found`);
                }

                // Rate limiting delay (increased for stability)
                if (i < wordsToProcess.length - 1) {
                    await this.sleep(200); // 200ms delay between API calls
                }
            } catch (error) {
                console.error(`❌ Failed to lookup word "${word}":`, error);
                // Skip this word - don't add to vocabulary without translation
                console.log(`⚠️ Skipping "${word}" due to lookup error`);
            }
        }

        console.log(`✅ Vocabulary extraction complete: ${vocabulary.length} words with meanings`);
        return vocabulary;
    }

    /**
     * Fetch word meaning from local dictionary
     * @deprecated Use Dictionary.lookup() directly instead
     */
    static async fetchMeaning(word: string): Promise<string | null> {
        return Dictionary.lookup(word);
    }

    /**
     * Sleep helper for rate limiting
     */
    static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get vocabulary statistics
     */
    static getStatistics(vocabulary: ExtractedVocabulary[]): {
        totalWords: number;
        uniqueWords: number;
        averageFrequency: number;
    } {
        const totalWords = vocabulary.reduce((sum, word) => sum + word.frequency, 0);
        const uniqueWords = vocabulary.length;
        const averageFrequency = uniqueWords > 0 ? totalWords / uniqueWords : 0;

        return {
            totalWords,
            uniqueWords,
            averageFrequency: Math.round(averageFrequency * 100) / 100,
        };
    }
}

