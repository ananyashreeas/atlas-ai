import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/app/lib/supabase-server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { message, chatId } = await req.json();

    // 1. Validate message
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required." },
        { status: 400 }
      );
    }

    const userMessage = message.trim();

    // 2. Get logged-in user
    const supabaseServer = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in." },
        { status: 401 }
      );
    }

    // 3. Resolve or Create Chat Thread
    let activeChatId = chatId;
    if (!activeChatId) {
      const { data: newChat, error: newChatError } = await supabaseAdmin
        .from("chats")
        .insert({
          title: userMessage.slice(0, 40),
          user_id: user.id,
        })
        .select()
        .single();

      if (newChatError) {
        console.error("Failed to create chat thread:", newChatError);
      } else if (newChat) {
        activeChatId = newChat.id;
      }
    }

    // 4. Retrieve conversation history for THIS specific chat thread
    let historyText = "No previous conversation.";
    if (activeChatId) {
      const { data: previousMessages, error: historyError } = await supabaseAdmin
        .from("chat_messages")
        .select("role, content")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true })
        .limit(30);

      if (historyError) {
        console.error("Failed to load chat history:", historyError);
      } else if (previousMessages && previousMessages.length > 0) {
        historyText = previousMessages
          .map((item) => {
            const role = item.role === "user" ? "STUDENT" : "ATLAS AI";
            return `${role}: ${item.content}`;
          })
          .join("\n\n");
      }
    }

    // 5. Save student's message to database
    if (activeChatId) {
      await supabaseAdmin.from("chat_messages").insert({
        user_id: user.id,
        chat_id: activeChatId,
        pdf_id: null,
        role: "user",
        content: userMessage,
      });
    }

    // 6. Format Prompt
    const prompt = `
You are Atlas AI, a personal AI study partner.
You are having a general study conversation with a student.

PREVIOUS CONVERSATION:
${historyText}

CURRENT STUDENT MESSAGE:
${userMessage}

FORMATTING RULES:
- Keep answers concise and student-friendly.
- For mathematical problems, show the solution step-by-step.
- For calculations, keep each operation on a separate line.
- When comparing two or more things, use a Markdown table.
- Use headings for longer answers.
- Use numbered steps for procedures.
- Use bullet points for lists.
- Put the final answer clearly under a "Final Answer" heading.
- Use LaTeX for mathematical equations.
- Use inline LaTeX like $x=5$ for short equations.
- Use display LaTeX like $$x=5$$ for important equations.
- Do not put mathematical solutions into one large paragraph.
- Avoid unnecessary motivational text and repetition.

IMPORTANT:
- Answer the student's current message.
- Use previous conversation when the student refers to something discussed earlier.
- Do not pretend to remember something that is not present in the conversation.
- Do not mention internal systems, databases, embeddings, or implementation details.
- If the student asks a normal general-knowledge question, answer it normally.
- If the student asks an academic question, explain it clearly at a student-friendly level.

Now answer the student's current message.
`;

    // 7. Initialize Gemini Model (Restored your exact model: gemini-3.6-flash)
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    let answer = "";
    try {
      const result = await model.generateContent(prompt);
      answer = result.response.text();
    } catch (genError: any) {
      // If temporary 503 spike, wait 1.5 seconds and retry once
      if (genError?.message?.includes("503") || genError?.status === 503) {
        console.warn("High demand detected, retrying request in 1.5s...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const retryResult = await model.generateContent(prompt);
        answer = retryResult.response.text();
      } else {
        throw genError;
      }
    }

    // 8. Save Atlas response to database
    if (activeChatId) {
      await supabaseAdmin.from("chat_messages").insert({
        user_id: user.id,
        chat_id: activeChatId,
        pdf_id: null,
        role: "assistant",
        content: answer,
      });
    }

    // 9. Return response with active chatId
    return NextResponse.json({
      success: true,
      answer,
      chatId: activeChatId,
    });
  } catch (error: any) {
    console.error("ATLAS GENERAL CHAT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate Atlas AI response.",
      },
      { status: 500 }
    );
  }
}