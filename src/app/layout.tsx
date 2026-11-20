import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raj Aryan | Frontend Developer",
  description:
    "Raj Aryan is a Computer Science Engineering student focused on frontend development, responsive web experiences, and exploring AI-powered tools.",
  keywords: [
    "Raj Aryan",
    "Frontend Developer",
    "React Developer",
    "Next.js Developer",
    "JavaScript Developer",
    "AI",
    "IILM University",
  ],
  openGraph: {
    title: "Raj Aryan | Frontend Developer",
    description: "Portfolio of Raj Aryan — frontend development, responsive web projects, and AI exploration.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
