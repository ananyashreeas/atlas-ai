export type PDFItem = {
  id: number;
  name: string;
  uploadedAt: string;
};

const STORAGE_KEY = "atlas-ai-pdfs";

export function getPDFs(): PDFItem[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);

  return stored ? JSON.parse(stored) : [];
}

export function savePDFs(files: PDFItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}