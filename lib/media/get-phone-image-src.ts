const PHONE_PLACEHOLDER = "/api/images/phone-placeholder.svg";

export function getPhoneImageSrc(imageUrl?: string): string {
  if (!imageUrl) {
    return PHONE_PLACEHOLDER;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("/api/")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/images/")) {
    return `/api${imageUrl}`;
  }

  return PHONE_PLACEHOLDER;
}
