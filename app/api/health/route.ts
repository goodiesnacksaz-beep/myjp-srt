import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const checks: any = {
        server: "✅ Running",
        database: "❌ Not checked",
        auth: "❌ Not checked",
        dictionary: "❌ Not checked",
        kuromoji: "❌ Not checked",
    };

    try {
        // Check database
        await prisma.$connect();
        checks.database = "✅ Connected";
    } catch (error) {
        checks.database = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
    }

    try {
        // Check auth
        const session = await getServerSession(authOptions);
        checks.auth = session ? `✅ Logged in as ${session.user?.email}` : "⚠️ Not logged in";
    } catch (error) {
        checks.auth = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
    }

    try {
        // Check dictionary
        const { Dictionary } = await import("@/lib/dictionary");
        checks.dictionary = "✅ Module loaded";
    } catch (error) {
        checks.dictionary = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
    }

    try {
        // Check kuromoji
        const { JapaneseProcessor } = await import("@/lib/japanese-processor");
        checks.kuromoji = "✅ Module loaded";
    } catch (error) {
        checks.kuromoji = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
    }

    return NextResponse.json({
        status: "ok",
        checks,
        timestamp: new Date().toISOString(),
    });
}

