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
  title: "🗳️ VoteChain - Transparent Decentralized Voting",
  description:
    "VoteChain is a decentralized application built on blockchain technology for transparent community voting, upvoting/downvoting ideas, and scheduling voting periods.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🗳️</span>
                  <h1 className="text-xl font-bold">VoteChain</h1>
                </div>
                <nav className="flex gap-4">
                  <a href="/" className="text-sm hover:text-primary">Home</a>
                  <a href="/wallet-demo" className="text-sm hover:text-primary">Wallet Demo</a>
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
