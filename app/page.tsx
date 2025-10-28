import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            <main className="max-w-4xl mx-auto px-6 py-12 text-center">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Japanese Subtitle Quiz
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Learn Japanese vocabulary from your favorite shows and movies
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                    Upload your subtitle files (.srt), extract vocabulary automatically,
                    and practice with interactive quizzes tailored to your content.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/login"
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        Get Started
                    </Link>
                    <Link
                        href="/signup"
                        className="px-8 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-semibold transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <div className="text-3xl mb-3">📁</div>
                        <h3 className="text-lg font-semibold mb-2">Upload Subtitles</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Upload your Japanese subtitle files (.srt format) with drag-and-drop support
                        </p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <div className="text-3xl mb-3">📚</div>
                        <h3 className="text-lg font-semibold mb-2">Extract Vocabulary</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Automatically extract and analyze Japanese words with readings and meanings
                        </p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <div className="text-3xl mb-3">✍️</div>
                        <h3 className="text-lg font-semibold mb-2">Practice Quizzes</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Test your knowledge with multiple quiz types and track your progress
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

