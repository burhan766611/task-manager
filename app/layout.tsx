import type { Metadata } from "next";
import "./globals.css"

export const metadata: Metadata = {
  title: "Task Manager App",
  description: "Secure full stack task management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-black">
        <main className="max-w-4xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}