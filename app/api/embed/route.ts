import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { chunks, pdfPath } = body;

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json(
        { error: "No chunks were provided." },
        { status: 400 }
      );
    }

    if (!pdfPath) {
      return NextResponse.json(
        { error: "PDF path is missing." },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    if (!supabaseUrl) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_SUPABASE_URL is missing.",
        },
        { status: 500 }
      );
    }

    if (!supabaseSecretKey) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY is missing.",
        },
        { status: 500 }
      );
    }

    // Server-side Supabase client.
    // This key must NEVER be exposed to the browser.
    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey
    );

    console.log("========== EMBEDDING START ==========");
    console.log("PDF:", pdfPath);
    console.log("Chunks:", chunks.length);

    let savedCount = 0;

    for (const chunk of chunks) {
      if (!chunk || typeof chunk !== "string") {
        continue;
      }

      // Generate embedding using Gemini
      const response = await fetch(
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
                  text: chunk,
                },
              ],
            },
            outputDimensionality: 768,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error(
          "Gemini embedding error:",
          result
        );

        return NextResponse.json(
          {
            error:
              result?.error?.message ||
              "Gemini embedding failed.",
          },
          { status: 500 }
        );
      }

      const embedding =
        result?.embedding?.values;

      if (
        !embedding ||
        !Array.isArray(embedding)
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini returned an invalid embedding.",
          },
          { status: 500 }
        );
      }

      // Save chunk + embedding to Supabase
      const { error: insertError } =
        await supabase
          .from("pdf_chunks")
          .insert({
            pdf_path: pdfPath,
            content: chunk,
            embedding,
          });

      if (insertError) {
        console.error(
          "Supabase insert error:",
          insertError
        );

        return NextResponse.json(
          {
            error:
              insertError.message,
          },
          { status: 500 }
        );
      }

      savedCount++;

      console.log(
        `Embedded chunk ${savedCount}/${chunks.length}`
      );
    }

    console.log(
      "========== EMBEDDINGS COMPLETE =========="
    );
    console.log(
      "Chunks saved:",
      savedCount
    );

    return NextResponse.json({
      success: true,
      chunksSaved: savedCount,
    });
  } catch (error) {
    console.error(
      "Embedding route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown embedding error.",
      },
      { status: 500 }
    );
  }
}