import type { Metadata } from "next";
import React, { type ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskly — Enterprise Task Management Platform",
  description: "Professional task management workspace for Taskly",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
