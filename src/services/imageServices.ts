import { supabaseClient } from "../lib/supabaseClient";
import type { Image } from "../types/types";

export async function UploadImage(
  file: File,
  bucket: "projects_images" | "buildings_images",
): Promise<Image | null> {
  const path = `${file.name} - ${crypto.randomUUID()}`;

  const { error: UploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file);

  if (UploadError) {
    console.error("Error Uploading Image: ", UploadError.message);
    return null;
  }

  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);

  return { url: data.publicUrl, path: path };
}
