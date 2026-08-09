import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const pdfId = searchParams.get("pdfId");

    if (!pdfId) {
      return NextResponse.json(
        {
          success: false,
          error: "pdfId is required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, pdf_id, role, content, created_at")
      .eq("pdf_id", Number(pdfId))
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "CHAT HISTORY ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: data || [],
    });

  } catch (error: any) {
    console.error(
      "CHAT HISTORY API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to load chat history.",
      },
      { status: 500 }
    );
  }
}