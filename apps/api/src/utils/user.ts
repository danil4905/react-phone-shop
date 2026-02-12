import type { User, UserPublic } from "@repo/shared";

export const toPublicUser = (user: User): UserPublic => ({
  id: user.id,
  email: user.email,
  name: user.name,
  lastName: user.lastName,
  avatarUrl: user.avatarUrl,
  about: user.about,
});
