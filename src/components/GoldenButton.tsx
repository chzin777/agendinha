"use client";

import type { ButtonHTMLAttributes } from "react";

interface GoldenButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export function GoldenButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: GoldenButtonProps) {
  if (variant === "outline") {
    return (
      <button
        className={`inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#c9a84c] bg-transparent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-[#8b6914] transition-all hover:bg-[#c9a84c]/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`golden-btn inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(160deg, #c9943a, #d4af37, #fef1a2, #dbb840, #c9943a)",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        border: "1px solid #b8922e",
        color: "#6b3a0a",
        textShadow: "0 1px 2px rgba(254, 241, 162, 0.8)",
        boxShadow:
          "0 3px 6px rgba(0,0,0,0.12), 0 3px 6px rgba(180,126,17,0.3), inset 0 -2px 4px 1px rgba(180,126,17,0.6), inset 0 -1px 1px 2px rgba(254,241,162,0.8)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundSize = "150% 150%";
        e.currentTarget.style.boxShadow =
          "0 8px 16px rgba(0,0,0,0.15), 0 4px 6px rgba(180,126,17,0.3), inset 0 -2px 4px 1px rgba(180,126,17,0.7), inset 0 -1px 1px 2px rgba(254,241,162,0.9)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundSize = "100% 100%";
        e.currentTarget.style.boxShadow =
          "0 3px 6px rgba(0,0,0,0.12), 0 3px 6px rgba(180,126,17,0.3), inset 0 -2px 4px 1px rgba(180,126,17,0.6), inset 0 -1px 1px 2px rgba(254,241,162,0.8)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow =
          "0 2px 4px rgba(0,0,0,0.1), 0 2px 4px rgba(180,126,17,0.25), inset 0 -2px 4px 1px rgba(180,126,17,0.7), inset 0 -1px 1px 2px rgba(254,241,162,0.8)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow =
          "0 8px 16px rgba(0,0,0,0.15), 0 4px 6px rgba(180,126,17,0.3), inset 0 -2px 4px 1px rgba(180,126,17,0.7), inset 0 -1px 1px 2px rgba(254,241,162,0.9)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}