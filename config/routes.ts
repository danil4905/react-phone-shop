export const ROUTES = {
  home: "/",
  cart: "/cart",
  orders: "/orders",
  account: {
    index: "/account",
    password: "/account/password",
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  phone: (id: string) => `/phones/${id}`,
} as const;
