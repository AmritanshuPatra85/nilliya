import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nillya The Makeup Studio | Book Appointments Online",
  description: "Nillya The Makeup Studio offers premium beauty services including bridal makeup, hair treatments, facials, waxing and more. Book your appointment online.",
  keywords: "makeup studio, beauty parlour, bridal makeup, hair treatment, facial, waxing, book appointment",
  openGraph: {
    title: "Nillya The Makeup Studio",
    description: "Premium beauty services. Book your appointment online.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}