import axios from "axios";
import { prisma } from "./db";

// In-memory cache to avoid repeated lookups within same session
const sessionCache = new Map<string, string>();
let cacheInitialized = false;

export class Dictionary {
    /**
     * Initialize the dictionary (just logs that we're using API)
     */
    static async initialize(): Promise<void> {
        if (cacheInitialized) return;

        console.log("✅ Dictionary initialized - using database cache + Jisho API");
        cacheInitialized = true;
    }

    /**
     * Look up a word with multi-level caching:
     * 1. Session cache (in-memory)
     * 2. Database cache (persistent)
     * 3. Jisho API (last resort)
     */
    static async lookup(word: string): Promise<string | null> {
        try {
            await this.initialize();

            // Level 1: Check session cache (fastest)
            if (sessionCache.has(word)) {
                const cached = sessionCache.get(word)!;
                console.log(`💨 Session cache hit for "${word}"`);
                return cached;
            }

            // Level 2: Check database cache (fast, persistent)
            const dbCached = await prisma.dictionaryCache.findUnique({
                where: { word },
            });

            if (dbCached) {
                console.log(`💾 Database cache hit for "${word}": ${dbCached.meaning}`);
                // Store in session cache for even faster access
                sessionCache.set(word, dbCached.meaning);
                return dbCached.meaning;
            }

            // Level 3: Fetch from API (slow)
            console.log(`🔍 Looking up "${word}" via API...`);
            const meaning = await this.lookupViaAPI(word);

            if (meaning) {
                console.log(`✅ Found "${word}": ${meaning}`);

                // Save to database cache for future use
                await this.saveToCache(word, meaning);

                // Save to session cache
                sessionCache.set(word, meaning);
            } else {
                console.log(`❌ No meaning found for "${word}"`);
            }

            return meaning;
        } catch (error) {
            console.error(`❌ Error looking up word "${word}":`, error);
            return null;
        }
    }

    /**
     * Save a word to database cache
     */
    private static async saveToCache(word: string, meaning: string): Promise<void> {
        try {
            await prisma.dictionaryCache.create({
                data: {
                    word,
                    meaning,
                },
            });
            console.log(`💾 Cached "${word}" in database`);
        } catch (error) {
            // Ignore duplicate errors (word already cached)
            if (error instanceof Error && !error.message.includes('Unique constraint')) {
                console.error(`Failed to cache "${word}":`, error);
            }
        }
    }

    /**
     * Look up word via Jisho API
     */
    private static async lookupViaAPI(word: string): Promise<string | null> {
        try {
            const response = await axios.get(
                `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`,
                {
                    timeout: 10000, // Increased to 10 seconds
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json',
                    }
                }
            );

            if (response.data.data && response.data.data.length > 0) {
                const firstResult = response.data.data[0];
                const senses = firstResult.senses;

                if (senses && senses.length > 0) {
                    const englishDefinitions = senses[0].english_definitions;
                    const meaning = englishDefinitions.slice(0, 3).join(", ");
                    return meaning;
                } else {
                    console.warn(`⚠️ No senses found for "${word}"`);
                }
            } else {
                console.warn(`⚠️ No results from API for "${word}"`);
            }

            return null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`❌ API error for "${word}": ${error.response?.status || 'unknown'} - ${error.message}`);
                if (error.response?.data) {
                    console.error('Response data:', error.response.data);
                }
            } else {
                console.error(`❌ Unexpected error for "${word}":`, error);
            }
            return null;
        }
    }

    /**
     * Batch lookup multiple words (much faster than individual lookups)
     */
    static async lookupBatch(words: string[]): Promise<Map<string, string>> {
        await this.initialize();

        const results = new Map<string, string>();

        for (const word of words) {
            const meaning = await this.lookup(word);
            if (meaning) {
                results.set(word, meaning);
            }
        }

        return results;
    }

    /**
     * Search with fuzzy matching
     */
    static async search(query: string, limit: number = 5): Promise<any[]> {
        await this.initialize();

        try {
            const results = dictionary.find(query);
            return results ? results.slice(0, limit) : [];
        } catch (error) {
            console.error(`Error searching for "${query}":`, error);
            return [];
        }
    }
}

