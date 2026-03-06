const AVATAR_PLACEHOLDER = "/images/placeholder-avatar.svg";

export function getAvatarSrc(avatar?: string): string {
  if (!avatar) {
    return AVATAR_PLACEHOLDER;
  }

  if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/api/")) {
    return avatar;
  }

  if (avatar.startsWith("/images/")) {
    return `/api${avatar}`;
  }

  return AVATAR_PLACEHOLDER;
}
