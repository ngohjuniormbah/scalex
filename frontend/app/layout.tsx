import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaleX — We fund the founders shaping tomorrow",
  description:
    "ScaleX is an exclusive venture capital platform for verified founders building the next generation of breakthrough companies.",
  openGraph: {
    title: "ScaleX",
    description: "We fund the founders shaping tomorrow.",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
