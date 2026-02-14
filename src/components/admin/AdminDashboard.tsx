"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Trash2, UserPlus, Shield, Search, RefreshCcw, 
  LogOut, BarChart3 
} from "lucide-react";

// 🧩 Drag and Drop Imports
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo: any; 
}

export default function AdminDashboard() {
  const router = useRouter(); 
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const [usersRes, tasksRes] = await Promise.all([
        axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/tasks", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setUsers(usersRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const token = localStorage.getItem("token");
    let newAssignedTo = null;

    if (destination.droppableId !== "unassigned") {
      newAssignedTo = destination.droppableId;
    }

    try {
      await axios.patch(
        `/api/tasks/${draggableId}`,
        { assignedTo: newAssignedTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      console.error("Assignment failed", err);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        "/api/admin/update-role",
        {
          userId,
          role: currentRole === "admin" ? "employee" : "admin",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const createUser = async () => {
    if (!name || !email || !password) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post("/api/admin/create-user", 
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName(""); setEmail(""); setPassword("");
      fetchData();
    } catch (err) { alert("Error creating user"); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete user?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Admin Command Center</h1>
            <p className="text-slate-500 text-sm">Monitor performance and manage access</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl">
               <Link href="/dashboard">
                  <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg transition-all">
                    Dashboard
                  </button>
               </Link>
               <Link href="/dashboard/analytics">
                  <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Drag Board UI */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">
                Drag & Assign Tasks
              </h2>

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* UNASSIGNED COLUMN */}
                  <Droppable droppableId="unassigned">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="bg-slate-50 p-4 rounded-xl min-h-[300px]"
                      >
                        <h3 className="text-xs font-bold uppercase mb-4 text-slate-400">
                          Unassigned
                        </h3>

                        {tasks
                          .filter((t) => !t.assignedTo)
                          .map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white p-3 rounded-lg shadow mb-3 text-sm font-semibold hover:shadow-md hover:bg-slate-50 transition border-l-4 border-slate-300"
                                >
                                  <p 
                                    onClick={() => router.push(`/dashboard/tasks/${task._id}`, { scroll: true })}
                                    className="cursor-pointer hover:underline underline-offset-2 decoration-slate-300"
                                  >
                                    {task.title}
                                  </p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* EMPLOYEE COLUMNS */}
                  {users
                    .filter((u) => u.role === "employee")
                    .map((user) => (
                      <Droppable key={user._id} droppableId={user._id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="bg-slate-50 p-4 rounded-xl min-h-[300px]"
                          >
                            <h3 className="text-xs font-bold uppercase mb-4 text-slate-400">
                              {user.name}
                            </h3>

                            {tasks
                              .filter((t) => (t.assignedTo?._id || t.assignedTo) === user._id)
                              .map((task, index) => (
                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="bg-white p-3 rounded-lg shadow mb-3 text-sm font-semibold hover:shadow-md hover:bg-slate-50 transition border-l-4 border-indigo-500"
                                    >
                                      <p 
                                        onClick={() => router.push(`/dashboard/tasks/${task._id}`, { scroll: true })}
                                        className="cursor-pointer hover:underline underline-offset-2 decoration-indigo-300"
                                      >
                                        {task.title}
                                      </p>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                </div>
              </DragDropContext>
            </section>

            {/* USER WORKLOAD TABLE */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
                <h2 className="font-bold text-slate-700">Employee Workload</h2>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    placeholder="Search users..." 
                    className="pl-9 pr-4 py-1.5 border rounded-full text-xs w-48"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b">
                      <th className="p-4 font-semibold">User Details</th>
                      <th className="p-4 font-semibold text-center">Workload</th>
                      <th className="p-4 text-right font-semibold">System Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const userTasks = tasks.filter(t => (t.assignedTo?._id || t.assignedTo) === u._id);
                      const doneTasks = userTasks.filter(t => t.status === "done");
                      return (
                        <tr key={u._id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              {u.name} {u.role === 'admin' && <Shield className="w-3 h-3 text-amber-500" />}
                            </div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </td>
                          <td className="p-4 text-center">
                             <div className="flex justify-center gap-4">
                                <span className="text-slate-500 text-xs">Total: <b>{userTasks.length}</b></span>
                                <span className="text-green-600 text-xs">Done: <b>{doneTasks.length}</b></span>
                             </div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-3 items-center">
                              <button
                                onClick={() => toggleRole(u._id, u.role)}
                                className="text-[10px] font-bold uppercase tracking-tight px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              >
                                {u.role === "admin" ? "Make Employee" : "Make Admin"}
                              </button>
                              <button onClick={() => deleteUser(u._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold mb-4">Work Progress</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Todo</p>
                  <p className="text-xl font-black text-slate-700">{tasks.filter(t => t.status === "todo").length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Doing</p>
                  <p className="text-xl font-black text-blue-600">{tasks.filter(t => t.status === "inprogress").length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Done</p>
                  <p className="text-xl font-black text-green-600">{tasks.filter(t => t.status === "done").length}</p>
                </div>
              </div>
            </section>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Live Tasks</p>
                  <p className="text-2xl font-black text-slate-800">{tasks.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Active Staff</p>
                  <p className="text-2xl font-black text-slate-800">{users.length}</p>
                </div>
             </div>

             <section className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-400" /> New Staff Member
                </h2>
                <div className="space-y-3">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-800 border-none p-2 rounded-lg text-sm" />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-800 border-none p-2 rounded-lg text-sm" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-800 border-none p-2 rounded-lg text-sm" />
                  <button onClick={createUser} className="w-full bg-indigo-500 p-2 rounded-lg font-bold text-sm hover:bg-indigo-400">Add User</button>
                </div>
             </section>

             {/* LIVE TASK MONITOR */}
             <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50">
                  <h2 className="font-bold text-sm text-slate-700">Live Task Monitor</h2>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                  {tasks.slice(0, 10).map(task => {
                    const assignedUser = users.find(u => u._id === (task.assignedTo?._id || task.assignedTo));
                    return (
                      <div
                        key={task._id}
                        onClick={() => router.push(`/dashboard/tasks/${task._id}`, { scroll: true })}
                        className="border-l-4 border-indigo-500 pl-3 py-2 cursor-pointer hover:bg-slate-50 transition-all rounded-r-lg"
                      >
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {task.title}
                        </p>

                        <div className="flex justify-between text-[10px] text-slate-400 uppercase mt-1">
                          <span>{assignedUser?.name || "Unassigned"}</span>
                          <span
                            className={
                              task.status === "done"
                                ? "text-green-500 font-bold"
                                : task.status === "inprogress"
                                ? "text-blue-500"
                                : ""
                            }
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </section>
          </div>
        </div>
      </div>
    </div>
  );
}