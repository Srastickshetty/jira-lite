import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Jira Lite | Workspace",
  description: "Task Management System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#fafafa] text-[#1a1a1a] antialiased selection:bg-zinc-200">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}