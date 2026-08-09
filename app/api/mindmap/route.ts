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
You are Atlas AI, a study assistant.

Analyze the following PDF study content and create a structured
mind map of the SUBJECT MATTER.

The purpose is to help a student visually understand how the
important concepts in the document are connected.

IMPORTANT RULES:

1. Use ONLY information supported by the provided PDF content.

2. Do not invent concepts or relationships.

3. Do not create a mind map about the PDF's pages, headings,
   paragraphs, or document structure.

4. The central topic should represent the main subject of the
   provided content.

5. Identify the most important concepts and sub-concepts.

6. Show meaningful relationships between concepts.

7. Prefer relationships such as:
   - explains
   - causes
   - depends on
   - consists of
   - leads to
   - is an example of
   - is a type of
   - differs from
   - is related to

8. Keep the mind map reasonably sized.
   Generate:
   - 1 central topic
   - 5 to 10 major concepts
   - useful sub-concepts beneath those concepts

9. Do not simply copy large paragraphs from the PDF.

10. Keep node labels short and useful for a visual mind map.

11. Every relationship must be supported by the PDF content.

RETURN ONLY VALID JSON.

Use exactly this structure:

{
  "title": "Main topic",
  "nodes": [
    {
      "id": "1",
      "label": "Main Topic",
      "type": "central"
    },
    {
      "id": "2",
      "label": "Concept",
      "type": "main"
    },
    {
      "id": "3",
      "label": "Subconcept",
      "type": "sub"
    }
  ],
  "edges": [
    {
      "source": "1",
      "target": "2",
      "label": "explains"
    },
    {
      "source": "2",
      "target": "3",
      "label": "includes"
    }
  ]
}

NODE RULES:

- Every node must have a unique id.
- "central" may only be used for the central topic.
- Major concepts should use "main".
- Smaller supporting concepts should use "sub".

EDGE RULES:

- source and target must refer to existing node IDs.
- Do not create self-connections.
- Keep relationship labels short.
- Do not create duplicate relationships.

QUALITY CHECK:

Before returning the JSON, check:

- Does the central topic represent the actual subject?
- Are the major concepts genuinely important?
- Are the relationships meaningful?
- Are the relationships supported by the PDF?
- Is this useful for studying?
- Is this about the subject matter rather than the PDF structure?

PDF STUDY CONTENT:

${context}
`;

    const result = await model.generateContent(prompt);

    const rawText = result.response
      .text()
      .trim();

    console.log(
      "========== RAW MIND MAP RESPONSE =========="
    );
    console.log(rawText);
    console.log(
      "========== END RAW MIND MAP RESPONSE =========="
    );

    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let mindMap;

    try {
      mindMap = JSON.parse(cleanedText);
    } catch {
      console.error(
        "MIND MAP JSON PARSE ERROR:",
        rawText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini returned an invalid mind map format.",
        },
        { status: 500 }
      );
    }

    if (
      !mindMap ||
      typeof mindMap !== "object" ||
      typeof mindMap.title !== "string" ||
      !Array.isArray(mindMap.nodes) ||
      !Array.isArray(mindMap.edges)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Generated mind map has an invalid structure.",
        },
        { status: 500 }
      );
    }

    // Validate nodes
    const validNodes = mindMap.nodes.every(
      (node: any) =>
        typeof node.id === "string" &&
        typeof node.label === "string" &&
        ["central", "main", "sub"].includes(
          node.type
        )
    );

    if (!validNodes) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Generated mind map contains invalid nodes.",
        },
        { status: 500 }
      );
    }

    // Validate edges
    const nodeIds = new Set(
      mindMap.nodes.map(
        (node: any) => node.id
      )
    );

    const validEdges = mindMap.edges.every(
      (edge: any) =>
        typeof edge.source === "string" &&
        typeof edge.target === "string" &&
        typeof edge.label === "string" &&
        nodeIds.has(edge.source) &&
        nodeIds.has(edge.target) &&
        edge.source !== edge.target
    );

    if (!validEdges) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Generated mind map contains invalid relationships.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mindMap,
    });
  } catch (error: any) {
    console.error(
      "MIND MAP API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate mind map.",
      },
      { status: 500 }
    );
  }
}