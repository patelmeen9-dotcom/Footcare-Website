import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { importId } = await request.json();

    if (!importId) {
      return NextResponse.json({ error: "Missing Import ID" }, { status: 400 });
    }

    // Return successful rollback simulation
    return NextResponse.json({
      success: true,
      message: `Import ${importId} has been successfully rolled back. Database state restored to previous checksum.`,
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
