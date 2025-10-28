"use client";

interface LoadingProgressProps {
    percentage: number;
    message: string;
    stage?: string;
    currentWord?: number;
    totalWords?: number;
}

export default function LoadingProgress({
    percentage,
    message,
    stage,
    currentWord,
    totalWords,
}: LoadingProgressProps) {
    // Ensure percentage is between 0 and 100
    const displayPercentage = Math.min(Math.max(Math.round(percentage), 0), 100);

    return (
        <div className="p-12">
            <div className="max-w-md mx-auto">
                {/* Animated icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                                {displayPercentage}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stage */}
                {stage && (
                    <div className="text-center mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                            {stage.replace('-', ' ').toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Word count if available */}
                {currentWord !== undefined && totalWords !== undefined && (
                    <div className="text-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Processing word {currentWord} of {totalWords}
                        </span>
                    </div>
                )}

                {/* Message */}
                <p className="text-center text-gray-700 dark:text-gray-300 mb-6 font-medium">
                    {message}
                </p>

                {/* Progress bar */}
                <div className="relative">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                            style={{ width: `${displayPercentage}%` }}
                        >
                            {/* Animated shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                        </div>
                    </div>

                    {/* Percentage label */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Processing...</span>
                        <span>{displayPercentage}%</span>
                    </div>
                </div>

                {/* Estimated time */}
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>This usually takes 30-60 seconds</p>
                    <p className="text-xs mt-1">The page will auto-update when complete</p>
                </div>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
}

