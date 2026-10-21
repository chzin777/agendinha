"use client";

import type { ReactNode } from "react";

interface GoldenCardProps {
  children: ReactNode;
  className?: string;
}

export function GoldenCard({ children, className = "" }: GoldenCardProps) {
  return (
    <div
      className={`rounded-xl p-[2px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] ${className}`}
      style={{
        background:
          "linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)",
      }}
    >
      <div className="rounded-[14px] bg-card p-5">{children}</div>
    </div>
  );
}