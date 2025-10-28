"use client";

import { useState } from "react";
import { SRTParser } from "@/lib/srt-parser";

export default function TestPage() {
    const [fileContent, setFileContent] = useState("");
    const [parseResult, setParseResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const content = await file.text();
            setFileContent(content);
            setError("");

            // Validate
            const validation = SRTParser.validate(content);
            if (!validation.valid) {
                setError(validation.error || "Invalid file");
                return;
            }

            // Parse
            const entries = SRTParser.parse(content);

            setParseResult({
                totalEntries: entries.length,
                sample: entries.slice(0, 5),
                stats: {
                    hasJapanese: entries.some(e => SRTParser["containsJapanese"](e.text)),
                    firstEntry: entries[0],
                    lastEntry: entries[entries.length - 1],
                }
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error parsing file");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">SRT Parser Test Page</h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Upload Test File</h2>
                    <input
                        type="file"
                        accept=".srt"
                        onChange={handleFileUpload}
                        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {parseResult && (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                                <h3 className="font-semibold mb-2">✅ File Parsed Successfully!</h3>
                                <p>Total Entries: <strong>{parseResult.totalEntries}</strong></p>
                                <p>Has Japanese: <strong>{parseResult.stats.hasJapanese ? "Yes" : "No"}</strong></p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">First Entry:</h3>
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {parseResult.stats.firstEntry?.startTime} → {parseResult.stats.firstEntry?.endTime}
                                    </p>
                                    <p className="mt-2">{parseResult.stats.firstEntry?.text}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Sample Entries (First 5):</h3>
                                <div className="space-y-2">
                                    {parseResult.sample.map((entry: any, index: number) => (
                                        <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                #{entry.sequence} - {entry.startTime} → {entry.endTime}
                                            </div>
                                            <div className="text-sm">{entry.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="font-semibold mb-2">🧪 Test Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Upload <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">test-srt/aot1.srt</code> or any .srt file</li>
                        <li>Verify the file is parsed correctly</li>
                        <li>Check that Japanese text is detected</li>
                        <li>Review the sample entries to ensure character names are removed</li>
                        <li>If successful here, the upload feature should work!</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

