import React from "react";

interface BadgeProps {
  type?: "status" | "priority" | "category";
  variant?: string;
  color?: string;
  children: React.ReactNode;
}

export function Badge({ type = "status", variant = "default", color, children }: BadgeProps) {
  const cssClass = `${type}-badge ${variant.toLowerCase().replace(/\s+/g, "-")}`;
  const style = color ? { borderColor: color, color } : {};

  return (
    <span className={`inline-badge-select ${cssClass}`} style={style}>
      {children}
    </span>
  );
}
