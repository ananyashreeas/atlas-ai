import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: Request) {
  try {
    const { context } = await req.json();

    if (!context) {
      return NextResponse.json(
        {
          success: false,
          error: "PDF context is required.",
        },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `
You are Atlas AI, a personal AI study partner.

Create a useful study summary from the following PDF content.

IMPORTANT:
- Use ONLY the provided PDF content.
- Do not invent facts.
- Keep the summary student-friendly.
- Focus on the most important concepts.
- Organize the answer with clear headings and bullet points.
- Include important definitions, formulas, facts, and relationships when present.
- Do not mention RAG, embeddings, chunks, vector databases, or internal systems.

PDF CONTENT:

${context}

Create the study summary now.
`;

    const result = await model.generateContent(prompt);

    const summary = result.response.text();

    return NextResponse.json({
      success: true,
      summary,
    });

  } catch (error: any) {
    console.error(
      "SUMMARY API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate summary.",
      },
      { status: 500 }
    );
  }
}