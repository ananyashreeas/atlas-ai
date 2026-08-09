import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export async function chunkText(text: string): Promise<string[]> {
  const chunks = await splitter.createDocuments([text]);

  return chunks.map((chunk) => chunk.pageContent);
}