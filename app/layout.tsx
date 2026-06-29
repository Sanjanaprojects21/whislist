import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "A calm, organized wishlist for thoughtful purchases."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
