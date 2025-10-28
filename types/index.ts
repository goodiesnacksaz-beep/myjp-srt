export interface SubtitleEntry {
    sequence: number;
    startTime: string;
    endTime: string;
    text: string;
}

export interface VocabularyWord {
    word: string;
    reading: string;
    meaning: string;
    contextSentence: string;
    frequency: number;
}

export interface QuizQuestion {
    id: string;
    type: 'recognition' | 'meaning' | 'context' | 'reverse';
    question: string;
    correctAnswer: string;
    options: string[];
    vocabularyId: string;
}

export interface QuizResult {
    score: number;
    totalQuestions: number;
    accuracy: number;
    answers: {
        questionId: string;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
    }[];
}

export interface FileUploadResponse {
    success: boolean;
    fileId?: string;
    filename?: string;
    wordCount?: number;
    error?: string;
}

export interface DashboardStats {
    totalFiles: number;
    totalWords: number;
    quizzesTaken: number;
    averageAccuracy: number;
}

