import { supabaseClient } from "../lib/supabaseClient";

export async function UploadImage(file: File): Promise<string | null> {
  const path = `${file.name} - ${crypto.randomUUID()}`;

  const { error: UploadError } = await supabaseClient.storage
    .from("projects_images")
    .upload(path, file);

  if (UploadError) {
    console.error("Error Uploading Image: ", UploadError.message);
    return null;
  }

  const { data } = supabaseClient.storage
    .from("projects_images")
    .getPublicUrl(path);

  return data.publicUrl;
}
