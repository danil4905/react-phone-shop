import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

export type CartItem = {
  phoneId: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ phoneId: string; quantity?: number }>) => {
      const quantity = action.payload.quantity ?? 1;
      const existingItem = state.items.find((item) => item.phoneId === action.payload.phoneId);

      if (existingItem) {
        existingItem.quantity += quantity;
        return;
      }

      state.items.push({ phoneId: action.payload.phoneId, quantity });
    },
    removeFromCart: (state, action: PayloadAction<{ phoneId: string }>) => {
      state.items = state.items.filter((item) => item.phoneId !== action.payload.phoneId);
    },
    setCartItemQuantity: (state, action: PayloadAction<{ phoneId: string; quantity: number }>) => {
      const item = state.items.find((entry) => entry.phoneId === action.payload.phoneId);
      if (!item) {
        return;
      }

      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((entry) => entry.phoneId !== action.payload.phoneId);
        return;
      }

      item.quantity = action.payload.quantity;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, setCartItemQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartItemsCount = (state: RootState) =>
  state.cart.items.reduce((acc, item) => acc + item.quantity, 0);

export default cartSlice.reducer;
