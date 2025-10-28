import { SubtitleEntry } from "@/types";

export class SRTParser {
    /**
     * Parse SRT file content into structured subtitle entries
     */
    static parse(content: string): SubtitleEntry[] {
        const entries: SubtitleEntry[] = [];

        // Remove BOM if present
        content = content.replace(/^\uFEFF/, '');

        // Split by double newlines to separate subtitle blocks
        const blocks = content.split(/\n\s*\n/);

        for (const block of blocks) {
            const lines = block.trim().split('\n');

            if (lines.length < 3) continue;

            // First line: sequence number
            const sequence = parseInt(lines[0].trim(), 10);
            if (isNaN(sequence)) continue;

            // Second line: timestamp
            const timestampMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
            if (!timestampMatch) continue;

            const startTime = timestampMatch[1];
            const endTime = timestampMatch[2];

            // Remaining lines: subtitle text
            const text = lines.slice(2).join('\n').trim();

            // Clean HTML tags if present
            const cleanText = this.cleanHTML(text);

            entries.push({
                sequence,
                startTime,
                endTime,
                text: cleanText,
            });
        }

        return entries;
    }

    /**
     * Remove HTML tags and clean special characters from subtitle text
     */
    static cleanHTML(text: string): string {
        // Remove HTML tags
        let cleaned = text.replace(/<[^>]*>/g, '');

        // Remove parenthetical character names like （アルミン）
        cleaned = cleaned.replace(/[（(][^)）]*[)）]/g, '');

        // Remove extra whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        return cleaned;
    }

    /**
     * Extract all Japanese text from subtitle entries
     */
    static extractJapaneseText(entries: SubtitleEntry[]): string {
        return entries
            .map(entry => entry.text)
            .filter(text => this.containsJapanese(text))
            .join('\n');
    }

    /**
     * Check if text contains Japanese characters
     */
    static containsJapanese(text: string): boolean {
        // Check for Hiragana, Katakana, or Kanji
        return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    }

    /**
     * Validate SRT file format
     */
    static validate(content: string): { valid: boolean; error?: string } {
        if (!content || content.trim().length === 0) {
            return { valid: false, error: "File is empty" };
        }

        const entries = this.parse(content);

        if (entries.length === 0) {
            return { valid: false, error: "No valid subtitle entries found" };
        }

        const hasJapanese = entries.some(entry => this.containsJapanese(entry.text));

        if (!hasJapanese) {
            return { valid: false, error: "No Japanese text found in subtitles" };
        }

        return { valid: true };
    }
}

