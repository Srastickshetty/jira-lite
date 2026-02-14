import React from "react";

/**
 * DashboardLayout
 * Standard wrapper for all dashboard routes.
 * This ensures consistent spacing and prevents the 
 * "Not a React Component" runtime error.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-[#F8FAFC]">
      {children}
    </section>
  );
}