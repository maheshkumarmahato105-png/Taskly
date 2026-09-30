import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "bulk";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "danger"
      ? "btn-danger"
      : variant === "bulk"
      ? "btn-bulk"
      : "btn-secondary";

  const sizeStyle =
    size === "sm"
      ? { height: "32px", padding: "0 10px", fontSize: "11px" }
      : size === "lg"
      ? { height: "44px", padding: "0 20px", fontSize: "14px" }
      : {};

  return (
    <button className={`btn ${variantClass} ${className}`} style={sizeStyle} {...props}>
      {children}
    </button>
  );
}
