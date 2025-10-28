"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardStats {
    totalFiles: number;
    totalWords: number;
    quizzesTaken: number;
    averageAccuracy: number;
    recentQuizzes: any[];
}

interface FileData {
    id: string;
    filename: string;
    uploadDate: string;
    vocabularyCount: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFilename, setEditFilename] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, filesResponse] = await Promise.all([
                fetch("/api/dashboard/stats"),
                fetch("/api/files"),
            ]);

            const statsData = await statsResponse.json();
            const filesData = await filesResponse.json();

            setStats(statsData);
            setFiles(filesData.files || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    const handleEditClick = (file: FileData) => {
        setEditingId(file.id);
        setEditFilename(file.filename.replace('.srt', ''));
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFilename("");
    };

    const handleSaveFilename = async (fileId: string) => {
        if (!editFilename.trim()) {
            alert("Filename cannot be empty");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`/api/files/${fileId}/filename`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filename: editFilename }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to update filename");
                setSaving(false);
                return;
            }

            // Update the files list
            setFiles(files.map(f =>
                f.id === fileId
                    ? { ...f, filename: data.filename }
                    : f
            ));

            console.log(`✅ Updated filename: ${data.filename}`);
            setEditingId(null);
            setEditFilename("");
        } catch (error) {
            console.error("Error updating filename:", error);
            alert("An error occurred while updating the filename");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) {
            return;
        }

        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    if (status === "loading" || loading) {
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome back, {session.user.name || session.user.email}!
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                            Total Files
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalFiles || 0}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                            Vocabulary Words
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalWords || 0}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                            Quizzes Taken
                        </div>
                        <div className="text-3xl font-bold">{stats?.quizzesTaken || 0}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                            Average Accuracy
                        </div>
                        <div className="text-3xl font-bold">
                            {stats?.averageAccuracy || 0}%
                        </div>
                    </div>
                </div>

                {/* Files List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Your Files</h2>
                        <Link
                            href="/upload"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Upload New File
                        </Link>
                    </div>

                    {files.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="mb-4">No files uploaded yet</p>
                            <Link
                                href="/upload"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Upload your first subtitle file
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Filename
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Upload Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Vocabulary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {files.map((file) => (
                                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                {editingId === file.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editFilename}
                                                            onChange={(e) => setEditFilename(e.target.value)}
                                                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                                            placeholder="Filename (without .srt)"
                                                        />
                                                        <span className="text-gray-500 text-sm">.srt</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium">{file.filename}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(file.uploadDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {file.vocabularyCount} words
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {editingId === file.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleSaveFilename(file.id)}
                                                            disabled={saving}
                                                            className="inline-flex items-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                                            title="Save"
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
                                                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
                                                            title="Cancel"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(file)}
                                                            disabled={editingId !== null}
                                                            className="text-blue-600 hover:underline mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Edit filename"
                                                        >
                                                            Edit
                                                        </button>
                                                        <Link
                                                            href={`/files/${file.id}`}
                                                            className="text-blue-600 hover:underline mr-4"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={`/quiz/${file.id}`}
                                                            className="text-green-600 hover:underline mr-4"
                                                        >
                                                            Quiz
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteFile(file.id)}
                                                            disabled={editingId !== null}
                                                            className="text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
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

