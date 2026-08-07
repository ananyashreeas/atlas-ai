"use client";

import { supabase } from "@/app/lib/supabase";

type PDFViewerProps = {
  path: string;
};

export default function PDFViewer({ path }: PDFViewerProps) {
  const { data } = supabase.storage
    .from("pdfs")
    .getPublicUrl(path);

  return (
    <div className="w-full h-[85vh] rounded-xl overflow-hidden border border-slate-700">
      <iframe
        src={data.publicUrl}
        title="PDF Viewer"
        className="w-full h-full"
      />
    </div>
  );
}