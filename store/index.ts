import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import cartReducer from "./cart";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
