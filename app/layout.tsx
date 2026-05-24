import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealQual AI | Real Estate Lead Qualification",
  description: "AI lead qualification assistant for real estate sales teams."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
