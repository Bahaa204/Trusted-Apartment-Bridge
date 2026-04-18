import { supabaseClient } from "../lib/supabaseClient";
import type { Image } from "../types/types";

/**
 * Uploads an image to the specified bucket.
 * @param file The image file to upload.
 * @param bucket The bucket to upload the image to.
 * @returns A promise resolving to the uploaded image data or null if an error occurs.
 */
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

/**
 * Deletes images from the specified bucket.
 * @param paths An array of image paths to delete.
 * @param bucket The bucket to delete the images from.
 * @returns A promise resolving to a boolean indicating whether the deletion was successful.
 */

export async function DeleteImages(
  paths: string[],
  bucket: "projects_images" | "buildings_images",
) {
  const { error: DeleteError } = await supabaseClient.storage
    .from(bucket)
    .remove(paths);

  if (DeleteError) {
    console.error("Error Deleting Image: ", DeleteError.message);
    return false;
  }

  return true;
}
