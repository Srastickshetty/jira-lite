"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Using Lucide for a better spinner

// Components
import AdminDashboard from "@/components/admin/AdminDashboard";
import EmployeeDashboard from "@/components/employee/EmployeeDashboard";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Auth error:", err);
        localStorage.removeItem("token"); // Clean up invalid token
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">
          Securing your session...
        </p>
      </div>
    );
  }

  // --- REDIRECT IF NO USER ---
  if (!user) return null;

  // --- DASHBOARD LAYOUT WRAPPER ---
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div key={user.role}>
    {user.role === "admin" ? (
      <AdminDashboard user={user} />
    ) : (
      <EmployeeDashboard user={user} />
    )}
  </div>
    </main>
  );
}