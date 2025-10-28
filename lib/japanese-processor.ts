import kuromoji from "kuromoji";
import path from "path";

let tokenizer: any = null;

export interface Token {
    word: string;
    reading: string;
    baseForm: string;
    partOfSpeech: string;
}

export class JapaneseProcessor {
    /**
     * Initialize the kuromoji tokenizer
     */
    static async initializeTokenizer(): Promise<void> {
        if (tokenizer) return;

        return new Promise((resolve, reject) => {
            // Try multiple possible dictionary paths for different environments
            let dicPath: string;
            
            if (process.env.VERCEL) {
                // Vercel environment
                dicPath = path.join(process.cwd(), 'node_modules/kuromoji/dict');
            } else if (process.env.NODE_ENV === 'production') {
                // AWS Lambda or other serverless
                dicPath = "/var/task/node_modules/kuromoji/dict";
            } else {
                // Local development
                dicPath = path.join(process.cwd(), 'node_modules/kuromoji/dict');
            }

            console.log(`🔧 Initializing kuromoji with dicPath: ${dicPath}`);

            kuromoji.builder({ dicPath }).build((err, _tokenizer) => {
                if (err) {
                    console.error("❌ Kuromoji initialization error:", err);
                    console.error("Attempted dicPath:", dicPath);
                    reject(err);
                } else {
                    tokenizer = _tokenizer;
                    console.log("✅ Kuromoji tokenizer initialized successfully");
                    resolve();
                }
            });
        });
    }

    /**
     * Tokenize Japanese text
     */
    static async tokenize(text: string): Promise<Token[]> {
        await this.initializeTokenizer();

        const tokens = tokenizer.tokenize(text);

        return tokens.map((token: any) => ({
            word: token.surface_form,
            reading: token.reading || token.surface_form,
            baseForm: token.basic_form || token.surface_form,
            partOfSpeech: token.pos,
        }));
    }

    /**
     * Filter tokens to get meaningful vocabulary words
     */
    static filterVocabulary(tokens: Token[]): Token[] {
        const excludedPOS = [
            '助詞',      // Particles
            '助動詞',    // Auxiliary verbs
            '記号',      // Symbols
            '接続詞',    // Conjunctions
            '連体詞',    // Adnominal adjectives
            '感動詞',    // Interjections
        ];

        return tokens.filter(token => {
            // Filter out particles and common words
            if (excludedPOS.some(pos => token.partOfSpeech.includes(pos))) {
                return false;
            }

            // Keep nouns, verbs, and adjectives
            const keepPOS = ['名詞', '動詞', '形容詞'];
            if (!keepPOS.some(pos => token.partOfSpeech.includes(pos))) {
                return false;
            }

            // Filter out single hiragana characters
            if (/^[\u3040-\u309F]$/.test(token.word)) {
                return false;
            }

            // Must contain kanji or be katakana
            const hasKanji = /[\u4E00-\u9FAF]/.test(token.word);
            const isKatakana = /^[\u30A0-\u30FF]+$/.test(token.word);

            return hasKanji || isKatakana;
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

