import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { question, pdfPath } = await request.json();

    if (!question || !pdfPath) {
      return NextResponse.json(
        {
          error: "Question and PDF path are required.",
        },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error:
            "Supabase server environment variables are missing.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // -----------------------------------------
    // 1. Convert the question into an embedding
    // -----------------------------------------

    const embeddingResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: {
            parts: [
              {
                text: question,
              },
            ],
          },
          outputDimensionality: 768,
        }),
      }
    );

    const embeddingResult =
      await embeddingResponse.json();

    if (!embeddingResponse.ok) {
      console.error(
        "Question embedding error:",
        embeddingResult
      );

      return NextResponse.json(
        {
          error:
            embeddingResult?.error?.message ||
            "Failed to create question embedding.",
        },
        { status: 500 }
      );
    }

    const queryEmbedding =
      embeddingResult?.embedding?.values;

    if (
      !queryEmbedding ||
      !Array.isArray(queryEmbedding)
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini returned an invalid question embedding.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // 2. Search the PDF chunks
    // -----------------------------------------

    const { data: chunks, error: searchError } =
      await supabase.rpc("match_pdf_chunks", {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 5,
        filter_pdf_path: pdfPath,
      });

    if (searchError) {
      console.error(
        "Vector search error:",
        searchError
      );

      return NextResponse.json(
        {
          error: searchError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "Retrieved chunks:",
      chunks?.length || 0
    );

    return NextResponse.json({
      success: true,
      chunks: chunks || [],
    });
  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown search error.",
      },
      { status: 500 }
    );
  }
}