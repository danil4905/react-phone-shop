"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type DropdownRenderArgs = {
  close: () => void;
};

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode | ((args: DropdownRenderArgs) => ReactNode);
  align?: "left" | "right";
  panelClassName?: string;
};

export function Dropdown({ trigger, children, align = "right", panelClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const alignClass = align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right";
  const panelStateClass = open
    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
    : "pointer-events-none -translate-y-1 scale-95 opacity-0";
  const content = typeof children === "function" ? children({ close }) : children;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
      >
        {trigger}
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={[
          "absolute top-full z-50 mt-2 min-w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg",
          "transform-gpu transition duration-150 ease-out",
          alignClass,
          panelStateClass,
          panelClassName ?? "",
        ].join(" ")}
      >
        {content}
      </div>
    </div>
  );
}
