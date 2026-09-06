import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseImportSnapshot } from "@/lib/import-snapshot";

function formatLogDate(date: Date) {
  return date.toISOString().replace("T", " ").substring(0, 16);
}

export async function GET() {
  try {
    const records = await db.importHistory.findMany({
      orderBy: { date: "desc" },
      take: 50,
    });

    const latestSuccess = records.find((record) => record.status === "SUCCESS");

    const logs = records.map((record) => {
      const status =
        record.status === "UNDONE" ? "ROLLED_BACK" : record.status;
      const snapshot = parseImportSnapshot(record.snapshot);
      const withinWindow =
        !record.rollbackWindowExpiry || record.rollbackWindowExpiry > new Date();
      const hasSnapshot =
        !!snapshot &&
        (snapshot.createdArticleNumbers.length > 0 || snapshot.updatedProducts.length > 0);

      return {
        id: record.id,
        fileName: record.zipFileName,
        date: formatLogDate(record.date),
        status,
        created: record.summaryCreated,
        updated: record.summaryUpdated,
        errors: record.summaryErrors,
        skipped: record.summarySkipped,
        canRollback:
          status === "SUCCESS" &&
          latestSuccess?.id === record.id &&
          withinWindow &&
          hasSnapshot,
      };
    });

    return NextResponse.json({ logs });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
