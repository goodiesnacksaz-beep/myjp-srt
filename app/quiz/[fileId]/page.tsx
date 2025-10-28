"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { QuizQuestion } from "@/types";

export default function QuizPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const fileId = params.fileId as string;

    const [quizType, setQuizType] = useState<string>("mixed");
    const [questionCount, setQuestionCount] = useState<number>(10);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string>("");
    const [answers, setAnswers] = useState<any[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleStartQuiz = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/quiz/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId,
                    quizType,
                    count: questionCount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to generate quiz");
                setLoading(false);
                return;
            }

            setQuestions(data.questions);
            setQuizStarted(true);
            setLoading(false);
        } catch (error) {
            setError("An error occurred");
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = () => {
        // Prevent double-click on finish
        if (submitting) return;

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        setAnswers([
            ...answers,
            {
                questionId: currentQuestion.id,
                vocabularyId: currentQuestion.vocabularyId,
                question: currentQuestion.question,
                questionType: currentQuestion.type,
                userAnswer: selectedAnswer,
                correctAnswer: currentQuestion.correctAnswer,
                isCorrect,
            },
        ]);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer("");
        } else {
            // Set submitting state for the last question
            setSubmitting(true);
            submitQuiz([
                ...answers,
                {
                    questionId: currentQuestion.id,
                    vocabularyId: currentQuestion.vocabularyId,
                    question: currentQuestion.question,
                    questionType: currentQuestion.type,
                    userAnswer: selectedAnswer,
                    correctAnswer: currentQuestion.correctAnswer,
                    isCorrect,
                },
            ]);
        }
    };

    const submitQuiz = async (finalAnswers: any[]) => {
        const score = finalAnswers.filter((a) => a.isCorrect).length;

        try {
            await fetch("/api/quiz/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId,
                    answers: finalAnswers,
                    score,
                    totalQuestions: questions.length,
                }),
            });

            setAnswers(finalAnswers);
            setShowResult(true);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            setShowResult(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    if (showResult) {
        const score = answers.filter((a) => a.isCorrect).length;
        const accuracy = Math.round((score / questions.length) * 100);

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                        <h1 className="text-3xl font-bold mb-4">Quiz Complete!</h1>

                        <div className="text-6xl font-bold mb-4">
                            {score} / {questions.length}
                        </div>

                        <div className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
                            {accuracy}% Accuracy
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setQuizStarted(false);
                                    setCurrentQuestionIndex(0);
                                    setSelectedAnswer("");
                                    setAnswers([]);
                                    setShowResult(false);
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Take Another Quiz
                            </button>
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                        </div>

                        <div className="mt-8 text-left">
                            <h2 className="text-xl font-semibold mb-4">Review Answers</h2>
                            <div className="space-y-4">
                                {answers.map((answer, index) => {
                                    // Get the question from the questions array (for backwards compatibility)
                                    const question = questions[index];
                                    const questionText = answer.question || question?.question || `Question ${index + 1}`;
                                    const questionType = answer.questionType || question?.type;

                                    return (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg ${answer.isCorrect
                                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="font-semibold text-gray-600 dark:text-gray-400">
                                                    Question {index + 1}
                                                </div>
                                                {questionType && (
                                                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full capitalize">
                                                        {questionType}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                                                {questionText}
                                            </div>
                                            <div className="text-sm space-y-2">
                                                <div className={answer.isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                                                    <span className="font-semibold">Your answer:</span> {answer.userAnswer}
                                                </div>
                                                {!answer.isCorrect && (
                                                    <div className="text-green-700 dark:text-green-400">
                                                        <span className="font-semibold">Correct answer:</span> {answer.correctAnswer}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link
                        href="/dashboard"
                        className="text-blue-600 hover:underline mb-4 inline-block"
                    >
                        ← Back to Dashboard
                    </Link>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                        <h1 className="text-3xl font-bold mb-6">Quiz Settings</h1>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Quiz Type
                                </label>
                                <select
                                    value={quizType}
                                    onChange={(e) => setQuizType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                >
                                    <option value="mixed">Mixed (All Types)</option>
                                    <option value="recognition">Recognition (Kanji → Reading)</option>
                                    <option value="meaning">Meaning (Word → English)</option>
                                    <option value="context">Context (Fill in Blank)</option>
                                    <option value="reverse">Reverse (English → Japanese)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Number of Questions
                                </label>
                                <select
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                >
                                    <option value={5}>5 questions</option>
                                    <option value={10}>10 questions</option>
                                    <option value={20}>20 questions</option>
                                    <option value={50}>50 questions</option>
                                </select>
                            </div>

                            <button
                                onClick={handleStartQuiz}
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
                            >
                                {loading ? "Generating Quiz..." : "Start Quiz"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Type: {currentQuestion.type}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                    <h2 className="text-2xl font-bold mb-8">{currentQuestion.question}</h2>

                    <div className="space-y-3 mb-8">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${selectedAnswer === option
                                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleNextQuestion}
                        disabled={!selectedAnswer || submitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Quiz...
                            </span>
                        ) : currentQuestionIndex < questions.length - 1 ? (
                            "Next Question"
                        ) : (
                            "Finish Quiz"
                        )}
                    </button>
                </div>

                <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

