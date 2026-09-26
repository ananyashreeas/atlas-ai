import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/app/lib/supabase-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const pdfId = searchParams.get("pdfId");
    const chatId = searchParams.get("chatId");

    // 1. Ensure at least one identifier is provided
    if (!pdfId && !chatId) {
      return NextResponse.json(
        {
          success: false,
          error: "Either pdfId or chatId is required.",
        },
        { status: 400 }
      );
    }

    // 2. Authenticate the requesting user
    const supabaseServer = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to view chat history.",
        },
        { status: 401 }
      );
    }

    // 3. Query history based on pdfId or chatId
    let query = supabaseAdmin
      .from("chat_messages")
      .select("id, pdf_id, chat_id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (pdfId) {
      const numericPdfId = Number(pdfId);
      query = isNaN(numericPdfId)
        ? query.eq("pdf_id", pdfId)
        : query.eq("pdf_id", numericPdfId);
    } else if (chatId) {
      query = query.eq("chat_id", chatId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("CHAT HISTORY ERROR:", error);
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
    console.error("CHAT HISTORY API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load chat history.",
      },
      { status: 500 }
    );
  }
}