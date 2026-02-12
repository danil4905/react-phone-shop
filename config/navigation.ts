import { ROUTES } from "./routes";

export const PUBLIC_LINKS = [
  { href: ROUTES.home, text: "Catalog" },
  { href: ROUTES.cart, text: "Cart" },
] as const;

export const PRIVATE_LINKS = [
  { href: ROUTES.account.index, text: "Account" },
  { href: ROUTES.orders, text: "Orders" },
] as const;
