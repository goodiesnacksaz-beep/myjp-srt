import { QuizQuestion } from "@/types";
import { Vocabulary } from "@prisma/client";

export type QuizType = "recognition" | "meaning" | "context" | "reverse";

export class QuizGenerator {
    /**
     * Generate quiz questions from vocabulary
     */
    static generateQuiz(
        vocabulary: Vocabulary[],
        quizType: QuizType,
        count: number
    ): QuizQuestion[] {
        const shuffled = this.shuffleArray([...vocabulary]);
        const selected = shuffled.slice(0, Math.min(count, vocabulary.length));

        const questions: QuizQuestion[] = [];

        for (const vocab of selected) {
            let question: QuizQuestion;

            switch (quizType) {
                case "recognition":
                    question = this.generateRecognitionQuestion(vocab, vocabulary);
                    break;
                case "meaning":
                    question = this.generateMeaningQuestion(vocab, vocabulary);
                    break;
                case "context":
                    question = this.generateContextQuestion(vocab, vocabulary);
                    break;
                case "reverse":
                    question = this.generateReverseQuestion(vocab, vocabulary);
                    break;
                default:
                    question = this.generateMeaningQuestion(vocab, vocabulary);
            }

            questions.push(question);
        }

        return questions;
    }

    /**
     * Generate recognition question (kanji → reading)
     */
    private static generateRecognitionQuestion(
        vocab: Vocabulary,
        allVocab: Vocabulary[]
    ): QuizQuestion {
        const options = this.generateOptions(
            vocab.reading,
            allVocab.map(v => v.reading),
            4
        );

        return {
            id: vocab.id,
            type: "recognition",
            question: `What is the reading of: ${vocab.word}?`,
            correctAnswer: vocab.reading,
            options: this.shuffleArray(options),
            vocabularyId: vocab.id,
        };
    }

    /**
     * Generate meaning question (word → English)
     */
    private static generateMeaningQuestion(
        vocab: Vocabulary,
        allVocab: Vocabulary[]
    ): QuizQuestion {
        const options = this.generateOptions(
            vocab.meaning,
            allVocab.map(v => v.meaning),
            4
        );

        return {
            id: vocab.id,
            type: "meaning",
            question: `What does ${vocab.word} (${vocab.reading}) mean?`,
            correctAnswer: vocab.meaning,
            options: this.shuffleArray(options),
            vocabularyId: vocab.id,
        };
    }

    /**
     * Generate context question (fill in the blank)
     */
    private static generateContextQuestion(
        vocab: Vocabulary,
        allVocab: Vocabulary[]
    ): QuizQuestion {
        const contextWithBlank = vocab.contextSentence.replace(
            vocab.word,
            "___"
        );

        const options = this.generateOptions(
            vocab.word,
            allVocab.map(v => v.word),
            4
        );

        return {
            id: vocab.id,
            type: "context",
            question: `Fill in the blank: ${contextWithBlank}`,
            correctAnswer: vocab.word,
            options: this.shuffleArray(options),
            vocabularyId: vocab.id,
        };
    }

    /**
     * Generate reverse question (English → Japanese)
     */
    private static generateReverseQuestion(
        vocab: Vocabulary,
        allVocab: Vocabulary[]
    ): QuizQuestion {
        const options = this.generateOptions(
            vocab.word,
            allVocab.map(v => v.word),
            4
        );

        return {
            id: vocab.id,
            type: "reverse",
            question: `How do you say "${vocab.meaning}" in Japanese?`,
            correctAnswer: vocab.word,
            options: this.shuffleArray(options),
            vocabularyId: vocab.id,
        };
    }

    /**
     * Generate unique options including the correct answer
     */
    private static generateOptions(
        correctAnswer: string,
        allOptions: string[],
        count: number
    ): string[] {
        const options = new Set<string>([correctAnswer]);
        const filtered = allOptions.filter(opt => opt !== correctAnswer);

        while (options.size < count && filtered.length > 0) {
            const randomIndex = Math.floor(Math.random() * filtered.length);
            options.add(filtered[randomIndex]);
            filtered.splice(randomIndex, 1);
        }

        return Array.from(options);
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    private static shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Generate mixed quiz with different question types
     */
    static generateMixedQuiz(
        vocabulary: Vocabulary[],
        count: number
    ): QuizQuestion[] {
        const types: QuizType[] = ["recognition", "meaning", "context", "reverse"];
        const questions: QuizQuestion[] = [];

        const shuffled = this.shuffleArray([...vocabulary]);
        const selected = shuffled.slice(0, Math.min(count, vocabulary.length));

        for (let i = 0; i < selected.length; i++) {
            const quizType = types[i % types.length];
            const vocab = selected[i];

            let question: QuizQuestion;

            switch (quizType) {
                case "recognition":
                    question = this.generateRecognitionQuestion(vocab, vocabulary);
                    break;
                case "meaning":
                    question = this.generateMeaningQuestion(vocab, vocabulary);
                    break;
                case "context":
                    question = this.generateContextQuestion(vocab, vocabulary);
                    break;
                case "reverse":
                    question = this.generateReverseQuestion(vocab, vocabulary);
                    break;
            }

            questions.push(question);
        }

        return this.shuffleArray(questions);
    }
}

