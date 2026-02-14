"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  BarChart3, 
  LayoutDashboard, 
  LogOut, 
  RefreshCcw 
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Task {
  _id: string;
  title: string;
  status: string;
  assignedTo?: any;
  dueDate?: string;
}

interface User {
  _id: string;
  name: string;
  role: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
useEffect(() => {
  console.log("Analytics Mounted");
}, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const [tasksRes, usersRes] = await Promise.all([
        axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  /* ---------------- Metrics ---------------- */
  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === "done").length;
  const overdue = tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status !== "done";
  }).length;

  const completionRate = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

  /* ---------------- Chart Data ---------------- */
  const tasksPerEmployee = users
    .filter(u => u.role === "employee")
    .map(user => {
      const count = tasks.filter(
        t => (t.assignedTo?._id || t.assignedTo) === user._id
      ).length;
      return { name: user.name, tasks: count };
    });

  const statusData = [
    { name: "Todo", value: tasks.filter(t => t.status === "todo").length },
    { name: "In Progress", value: tasks.filter(t => t.status === "inprogress").length },
    { name: "Done", value: tasks.filter(t => t.status === "done").length },
  ];

  const COLORS = ["#E5E7EB", "#CBD5E1", "#111827"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* 🆕 UNIFIED TOPBAR */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
             </Link>
             <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">System Analytics</h1>
                <p className="text-slate-500 text-sm">Real-time performance metrics</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Navigation Group */}
            <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl">
               <Link href="/dashboard">
                  <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </button>
               </Link>
               <Link href="/dashboard/analytics">
                  <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg transition-all">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics
                  </button>
               </Link>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 mx-1" />

            <button onClick={fetchData} className="p-2 bg-white border rounded-full hover:bg-slate-50 transition-colors">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <MetricCard label="Total Tasks" value={totalTasks} />
          <MetricCard label="Completion Rate" value={`${completionRate}%`} />
          <MetricCard label="Overdue Tasks" value={overdue} />
          <MetricCard label="Active Employees" value={users.filter(u => u.role === "employee").length} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">
              Tasks Per Employee
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksPerEmployee}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="tasks" fill="#111827" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">
              Status Distribution
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <p className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] mb-2">
        {label}
      </p>
      <h2 className="text-3xl font-black text-slate-900">{value}</h2>
    </div>
  );
}