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
You are Atlas AI, an intelligent study assistant.

Your task is to create a meaningful academic quiz based ONLY on the
SUBJECT MATTER contained in the provided PDF content.

The quiz is for a student who wants to test whether they actually
UNDERSTAND what they studied.

==================================================
ABSOLUTE RULES
==================================================

1. Create exactly 10 multiple-choice questions.

2. Each question must have exactly 4 options.

3. There must be exactly ONE correct answer.

4. Every question MUST test knowledge, understanding, reasoning,
   interpretation, application, comparison, or recall of the SUBJECT
   MATTER.

5. Questions must be answerable from the provided PDF content.

6. NEVER ask about:
   - page numbers
   - where something appears in the PDF
   - headings
   - paragraph numbers
   - section numbers
   - formatting
   - document structure
   - the position of information
   - the wording of a sentence
   - the number of times something appears
   - what page contains a concept
   - what section contains a concept

7. NEVER create questions like:

   "On which page is X discussed?"

   "Where is X mentioned?"

   "What is the heading of the section about X?"

   "Which page contains the definition of X?"

8. Do NOT make questions about the PDF itself.

   Ask questions ABOUT THE SUBJECT MATTER IN THE PDF.

9. Do not invent information that is not supported by the PDF.

10. Do not use outside knowledge to create answers.

11. If the PDF does not contain enough information to create a
    particular type of question, choose another question type that
    IS supported by the PDF.

==================================================
QUESTION QUALITY
==================================================

Prefer questions such as:

- What is the meaning of X?
- What is the function of X?
- Why does X happen?
- What happens when X changes?
- Which statement correctly explains X?
- What is the difference between X and Y?
- Which situation is an example of X?
- What would happen if...?
- Which conclusion follows from the information?
- How does X affect Y?
- What is the purpose of X?
- Which statement is correct according to the concept?
- Which step/result follows from the described process?

If formulas or numerical examples exist in the PDF, you may also create
calculation or formula-interpretation questions.

If diagrams or processes are described in the supplied content, you may
ask questions about what they represent or how the process works.

==================================================
DIFFICULTY
==================================================

Create a balanced quiz:

Questions 1-3:
EASY

Questions 4-7:
MEDIUM

Questions 8-10:
HARDER

Harder questions should test reasoning or application rather than
simply copying a sentence from the PDF.

==================================================
DISTRACTORS
==================================================

The incorrect options must be plausible.

Do NOT make obviously silly options.

Do NOT make the correct answer noticeably longer than the others.

Do NOT use "all of the above" or "none of the above".

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do not use markdown.

Do not include explanations outside the JSON.

Use exactly this structure:

[
  {
    "question": "Question here",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "explanation": "Short explanation based on the PDF content."
  }
]

correctAnswer MUST be a zero-based index:

0 = first option
1 = second option
2 = third option
3 = fourth option

==================================================
FINAL QUALITY CHECK
==================================================

Before returning the JSON, internally check every question:

- Is this about the SUBJECT MATTER?
- Can the answer be supported by the supplied PDF content?
- Does it test something useful for studying?
- Is it NOT about page numbers or document structure?
- Is there exactly one correct answer?
- Are the distractors plausible?

If any question fails these checks, replace it.

==================================================
PDF STUDY CONTENT
==================================================

${context}
`;

    const result = await model.generateContent(prompt);

    const rawText = result.response
      .text()
      .trim();

    console.log(
      "========== RAW QUIZ RESPONSE =========="
    );
    console.log(rawText);
    console.log(
      "========== END RAW QUIZ RESPONSE =========="
    );

    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let quiz;

    try {
      quiz = JSON.parse(cleanedText);
    } catch {
      console.error(
        "QUIZ JSON PARSE ERROR:",
        rawText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini returned an invalid quiz format.",
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(quiz)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Generated quiz is not an array.",
        },
        { status: 500 }
      );
    }

    // Validate every question
    const validQuiz = quiz.every(
      (item: any) =>
        typeof item.question === "string" &&
        item.question.trim().length > 0 &&
        Array.isArray(item.options) &&
        item.options.length === 4 &&
        item.options.every(
          (option: any) =>
            typeof option === "string"
        ) &&
        typeof item.correctAnswer ===
          "number" &&
        item.correctAnswer >= 0 &&
        item.correctAnswer <= 3 &&
        typeof item.explanation ===
          "string" &&
        item.explanation.trim().length > 0
    );

    if (!validQuiz) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Generated quiz has an invalid structure.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error: any) {
    console.error(
      "QUIZ API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate quiz.",
      },
      { status: 500 }
    );
  }
}