const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const videoTypes = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/avi",
  "video/x-msvideo",
  "video/x-flv",
  "video/webm",
  "video/wmv",
  "video/x-ms-wmv",
  "video/3gpp",
];

export function validateMedia(media) {
  if (!media) return null;

  const isImage = imageTypes.includes(media.mimeType);
  const isVideo = videoTypes.includes(media.mimeType);
  if ((!isImage && !isVideo) || typeof media.data !== "string") {
    return "Upload a supported image or video file.";
  }

  const maxBase64Length = isVideo ? 17 * 1024 * 1024 : 10 * 1024 * 1024;
  if (media.data.length > maxBase64Length) {
    return `The ${isVideo ? "video" : "image"} is too large. Use a ${
      isVideo ? "video under 12 MB" : "image under 7 MB"
    }.`;
  }
  return null;
}
