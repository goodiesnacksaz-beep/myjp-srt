"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";

export default function UploadPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Upload Subtitle File</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Upload a Japanese subtitle file (.srt) to extract vocabulary
                    </p>
                </div>

                <FileUpload />

                <div className="mt-12 max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">How it works</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Upload your .srt file</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Choose a Japanese subtitle file from your computer
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Automatic processing</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    We'll extract Japanese vocabulary with readings and meanings
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Start practicing</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Take quizzes to test and improve your vocabulary knowledge
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

