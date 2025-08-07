import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Website Performance Testing Tool",
  description: "Comprehensive domain performance analysis including CDN status, network latency, SSL certificates and server performance detection",
  keywords: ["Performance", "CDN", "Network", "SSL", "Testing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}