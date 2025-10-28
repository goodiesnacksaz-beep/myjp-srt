"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LoadingProgress from "@/components/LoadingProgress";

interface Vocabulary {
    id: string;
    word: string;
    reading: string;
    meaning: string;
    contextSentence: string;
    frequency: number;
}

interface FileDetails {
    id: string;
    filename: string;
    uploadDate: string;
    fileSize: number;
    vocabulary: Vocabulary[];
}

export default function FileDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const fileId = params.id as string;
    const [file, setFile] = useState<FileDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ word: "", reading: "", meaning: "" });
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState<{
        isProcessing: boolean;
        percentage: number;
        message: string;
        stage: string;
        currentWord?: number;
        totalWords?: number;
    } | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session && fileId) {
            fetchFileDetails();
            checkProgress();
        }
    }, [session, fileId]);

    // Poll for progress every 2 seconds if processing
    useEffect(() => {
        if (progress?.isProcessing) {
            const interval = setInterval(() => {
                checkProgress();
                fetchFileDetails();
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [progress?.isProcessing]);

    const checkProgress = async () => {
        try {
            const response = await fetch(`/api/files/${fileId}/progress`);
            const data = await response.json();

            console.log("📊 Client received progress data:", data);

            if (data.isProcessing) {
                const progressData = {
                    isProcessing: true,
                    percentage: data.percentage || 0,
                    message: data.progress?.message || "Processing...",
                    stage: data.progress?.stage || "processing",
                    currentWord: data.progress?.currentWord,
                    totalWords: data.progress?.totalWords,
                };
                console.log("📊 Setting progress state:", progressData);
                setProgress(progressData);
            } else if (data.isComplete) {
                console.log("✅ Processing complete!");
                setProgress(null);
            }
        } catch (error) {
            console.error("Error checking progress:", error);
        }
    };

    const fetchFileDetails = async () => {
        try {
            const response = await fetch(`/api/files/${fileId}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to load file");
                setLoading(false);
                return;
            }

            setFile(data.file);
            setLoading(false);
        } catch (error) {
            setError("An error occurred");
            setLoading(false);
        }
    };

    const handleEditClick = (vocab: Vocabulary) => {
        setEditingId(vocab.id);
        setEditForm({
            word: vocab.word,
            reading: vocab.reading,
            meaning: vocab.meaning,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ word: "", reading: "", meaning: "" });
    };

    const handleSaveEdit = async (vocabularyId: string) => {
        if (!editForm.word.trim() || !editForm.reading.trim() || !editForm.meaning.trim()) {
            alert("All fields are required");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`/api/vocabulary/${vocabularyId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editForm),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to update vocabulary item");
                setSaving(false);
                return;
            }

            // Update the file state with the updated vocabulary item
            if (file) {
                setFile({
                    ...file,
                    vocabulary: file.vocabulary.map((v) =>
                        v.id === vocabularyId
                            ? { ...v, ...editForm }
                            : v
                    ),
                });
            }

            console.log(`✅ Updated vocabulary: ${editForm.word}`);
            setEditingId(null);
            setEditForm({ word: "", reading: "", meaning: "" });
        } catch (error) {
            console.error("Error updating vocabulary:", error);
            alert("An error occurred while updating the vocabulary item");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteVocabulary = async (vocabularyId: string, word: string) => {
        if (!confirm(`Are you sure you want to delete "${word}" from your vocabulary list?`)) {
            return;
        }

        setDeletingId(vocabularyId);

        try {
            const response = await fetch(`/api/vocabulary/${vocabularyId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to delete vocabulary item");
                setDeletingId(null);
                return;
            }

            // Update the file state to remove the deleted vocabulary item
            if (file) {
                setFile({
                    ...file,
                    vocabulary: file.vocabulary.filter((v) => v.id !== vocabularyId),
                });
            }

            console.log(`✅ Deleted vocabulary: ${word}`);
        } catch (error) {
            console.error("Error deleting vocabulary:", error);
            alert("An error occurred while deleting the vocabulary item");
        } finally {
            setDeletingId(null);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (!session || !file) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="text-blue-600 hover:underline mb-4 inline-block"
                    >
                        ← Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{file.filename}</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Uploaded on {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                        </div>
                        <Link
                            href={`/quiz/${file.id}`}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Start Quiz
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">File Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                Total Vocabulary
                            </div>
                            <div className="text-2xl font-bold">
                                {file.vocabulary.length} words
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                File Size
                            </div>
                            <div className="text-2xl font-bold">
                                {(file.fileSize / 1024).toFixed(2)} KB
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                Most Frequent Word
                            </div>
                            <div className="text-2xl font-bold">
                                {file.vocabulary[0]?.word || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold">Vocabulary List</h2>
                    </div>

                    {file.vocabulary.length === 0 ? (
                        progress?.isProcessing ? (
                            <LoadingProgress
                                percentage={progress.percentage}
                                message={progress.message}
                                stage={progress.stage}
                                currentWord={progress.currentWord}
                                totalWords={progress.totalWords}
                            />
                        ) : (
                            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                <p>No vocabulary extracted yet. Processing may still be in progress.</p>
                                <button
                                    onClick={() => {
                                        checkProgress();
                                        fetchFileDetails();
                                    }}
                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Word
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Reading
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Meaning
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Frequency
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Context
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-y-gray-200 dark:divide-gray-700">
                                    {file.vocabulary.map((vocab) => (
                                        <tr key={vocab.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            {editingId === vocab.id ? (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={editForm.word}
                                                            onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                                            placeholder="Word"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={editForm.reading}
                                                            onChange={(e) => setEditForm({ ...editForm, reading: e.target.value })}
                                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                                            placeholder="Reading"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={editForm.meaning}
                                                            onChange={(e) => setEditForm({ ...editForm, meaning: e.target.value })}
                                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                                            placeholder="Meaning"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {vocab.frequency}x
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                        {vocab.contextSentence}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleSaveEdit(vocab.id)}
                                                                disabled={saving}
                                                                className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title="Save changes"
                                                            >
                                                                {saving ? (
                                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                disabled={saving}
                                                                className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title="Cancel editing"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                        {vocab.word}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {vocab.reading}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {vocab.meaning}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {vocab.frequency}x
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                        {vocab.contextSentence}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleEditClick(vocab)}
                                                                disabled={editingId !== null || deletingId === vocab.id}
                                                                className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title="Edit this vocabulary item"
                                                                aria-label={`Edit ${vocab.word}`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteVocabulary(vocab.id, vocab.word)}
                                                                disabled={editingId !== null || deletingId === vocab.id}
                                                                className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title="Delete this vocabulary item"
                                                                aria-label={`Delete ${vocab.word}`}
                                                            >
                                                                {deletingId === vocab.id ? (
                                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

