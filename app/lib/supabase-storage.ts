import { supabase } from "./supabase";

export async function uploadPDF(file: File) {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("pdfs")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("pdfs")
    .getPublicUrl(fileName);

  return {
    name: file.name,
    path: fileName,
    url: data.publicUrl,
  };
}

export async function getPDFs() {
  const { data, error } = await supabase.storage
    .from("pdfs")
    .list("", {
      limit: 100,
    });

  if (error) throw error;

  return data;
}

export async function deletePDF(path: string) {
  await supabase.storage
    .from("pdfs")
    .remove([path]);
}