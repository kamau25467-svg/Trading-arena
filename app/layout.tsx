
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIP ARENA | Trade the Moment",
  description:
    "Enter Pip Arena. Experience an immersive forex trading simulation and trading platform.",
  applicationName: "PIP ARENA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
