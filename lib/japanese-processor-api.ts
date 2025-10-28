import axios from "axios";

export interface Token {
    word: string;
    reading: string;
    baseForm: string;
    partOfSpeech: string;
}

/**
 * Lightweight Japanese processor using external API
 * Better suited for serverless environments like Vercel
 */
export class JapaneseProcessorAPI {
    /**
     * Tokenize Japanese text using Jisho.org API or simple regex fallback
     */
    static async tokenize(text: string): Promise<Token[]> {
        try {
            console.log(`🔤 Tokenizing text: "${text.substring(0, 50)}..."`);
            
            // Simple regex-based extraction for now (fast and reliable)
            const tokens = this.simpleTokenize(text);
            
            console.log(`✅ Extracted ${tokens.length} tokens`);
            return tokens;
        } catch (error) {
            console.error('Tokenization error:', error);
            return [];
        }
    }

    /**
     * Simple regex-based tokenization
     * Extracts kanji words and katakana words
     */
    private static simpleTokenize(text: string): Token[] {
        const tokens: Token[] = [];
        
        // Remove common particles and extract words with kanji
        const kanjiPattern = /[一-龯々]+[ぁ-ん]*/g;
        const katakanaPattern = /[ァ-ヶー]+/g;
        
        // Extract kanji-based words
        const kanjiMatches = text.match(kanjiPattern) || [];
        kanjiMatches.forEach(word => {
            if (word.length >= 2) { // Skip single character
                tokens.push({
                    word: word,
                    reading: word, // Will be looked up later
                    baseForm: word,
                    partOfSpeech: '名詞' // Assume noun
                });
            }
        });
        
        // Extract katakana words (often loanwords)
        const katakanaMatches = text.match(katakanaPattern) || [];
        katakanaMatches.forEach(word => {
            if (word.length >= 2) {
                tokens.push({
                    word: word,
                    reading: word,
                    baseForm: word,
                    partOfSpeech: '名詞'
                });
            }
        });
        
        return tokens;
    }

    /**
     * Filter tokens to get meaningful vocabulary words
     */
    static filterVocabulary(tokens: Token[]): Token[] {
        // Remove duplicates
        const seen = new Set<string>();
        return tokens.filter(token => {
            if (seen.has(token.word)) {
                return false;
            }
            seen.add(token.word);
            return true;
        });
    }

    /**
     * Convert katakana to hiragana
     */
    static katakanaToHiragana(str: string): string {
        return str.replace(/[\u30A1-\u30F6]/g, (match) => {
            const chr = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(chr);
        });
    }

    /**
     * Get reading in hiragana
     */
    static getHiraganaReading(reading: string): string {
        return this.katakanaToHiragana(reading);
    }
}

