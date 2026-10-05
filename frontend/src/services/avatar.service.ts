import { supabase } from "../lib/supabase";

const BUCKET_NAME = "avatars";

export async function uploadAvatar(
  file: File
): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Utilisateur non connecté.");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Format non autorisé. Utilisez JPG, PNG ou WEBP."
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error(
      "La photo ne doit pas dépasser 2 Mo."
    );
  }

  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const filePath = `${user.id}/profile.${extension}`;

  const { error: uploadError } =
    await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: profileError } =
    await supabase
      .from("profils")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return avatarUrl;
}