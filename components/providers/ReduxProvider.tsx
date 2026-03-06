"use client";

import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";

const store = makeStore();

export default function ReduxProvider({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}
