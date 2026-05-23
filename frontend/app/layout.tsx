import "./globals.css";
import React from "react";

export const metadata = {
  title: "Vitalis AI - Preventive Health Intelligence Platform",
  description: "Futuristic medical report extractor and deterministic clinical analysis console.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen relative flex flex-col justify-between">
          {children}
        </div>
      </body>
    </html>
  );
}
