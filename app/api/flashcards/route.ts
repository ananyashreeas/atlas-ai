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

Create useful study flashcards from the provided PDF content.

IMPORTANT:
- Use ONLY the information provided in the PDF content.
- Do not invent facts.
- Focus on important concepts, definitions, formulas, facts, and relationships.
- Make the questions suitable for a college student.
- Keep answers concise but accurate.
- Create exactly 10 flashcards.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not add explanations outside the JSON.

Use this exact format:

[
  {
    "question": "Question here",
    "answer": "Answer here"
  }
]

PDF CONTENT:

${context}
`;

    const result = await model.generateContent(prompt);

    const rawText = result.response.text().trim();

    // Remove markdown code fences if Gemini happens to add them
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let flashcards;

    try {
      flashcards = JSON.parse(cleanedText);
    } catch {
      console.error(
        "FLASHCARD JSON PARSE ERROR:",
        rawText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini returned an invalid flashcard format.",
        },
        { status: 500 }
      );
    }

    if (
      !Array.isArray(flashcards) ||
      flashcards.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No flashcards were generated.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      flashcards,
    });

  } catch (error: any) {
    console.error(
      "FLASHCARDS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate flashcards.",
      },
      { status: 500 }
    );
  }
}