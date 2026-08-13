import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/app/lib/supabase-server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const {
      question,
      context,
      pdfId,
    } = await req.json();

    if (!question || !context || !pdfId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Question, context and pdfId are required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 1. Get currently logged-in user
    // -----------------------------------------

    const supabaseServer =
      await createServerClient();

    const {
      data: { user },
      error: userError,
    } =
      await supabaseServer.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // 2. Get previous conversation
    // -----------------------------------------

    const {
      data: previousMessages,
      error: historyError,
    } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("pdf_id", pdfId)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      })
      .limit(20);

    if (historyError) {
      console.error(
        "Chat history error:",
        historyError
      );
    }

    // -----------------------------------------
    // 3. Save user's question
    // -----------------------------------------

    const { error: questionSaveError } =
      await supabase
        .from("chat_messages")
        .insert({
          pdf_id: pdfId,
          user_id: user.id,
          role: "user",
          content: question,
        });

    if (questionSaveError) {
      console.error(
        "Failed to save user message:",
        questionSaveError
      );
    }

    // -----------------------------------------
    // 4. Build conversation history
    // -----------------------------------------

    const historyText =
      previousMessages &&
      previousMessages.length > 0
        ? previousMessages
            .map(
              (message) =>
                `${message.role.toUpperCase()}: ${message.content}`
            )
            .join("\n\n")
        : "No previous conversation.";

    // -----------------------------------------
    // 5. Ask Gemini
    // -----------------------------------------

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `
You are Atlas AI, a personal AI study partner.

You are answering questions about an uploaded PDF.

Use the retrieved PDF context as your primary source.

IMPORTANT RULES:

1. Do not invent information.
2. If the answer cannot be found in the PDF context, clearly say that you could not find it in the uploaded PDF.
3. Use previous conversation only to understand what the user is referring to.
4. Give clear, student-friendly explanations.
5. If appropriate, use bullet points or numbered steps.
6. Do not mention internal RAG systems, embeddings, vector databases, or retrieved chunks to the student.

PREVIOUS CONVERSATION:
${historyText}

CURRENT PDF CONTEXT:
${context}

CURRENT USER QUESTION:
${question}

Now answer the user's question.
`;

    const result =
      await model.generateContent(prompt);

    const answer =
      result.response.text();

    // -----------------------------------------
    // 6. Save Atlas's answer
    // -----------------------------------------

    const { error: saveError } =
      await supabase
        .from("chat_messages")
        .insert({
          pdf_id: pdfId,
          user_id: user.id,
          role: "assistant",
          content: answer,
        });

    if (saveError) {
      console.error(
        "Failed to save assistant message:",
        saveError
      );
    }

    return NextResponse.json({
      success: true,
      answer,
    });

  } catch (error: any) {
    console.error(
      "CHAT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate AI answer.",
      },
      { status: 500 }
    );
  }
}