"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  RefreshCcw,
  Trash2,
  LogOut,
  Edit3,
  Check,
  X
} from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo?: any;
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // Data States
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const res = await axios.get(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask(res.data);
      setEditedTask(res.data); // Initialize form with fetched data
    } catch (err) {
      console.error("Failed to fetch task", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await axios.patch(`/api/tasks/${id}`, editedTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
      fetchTask();
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/tasks/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTask();
    } catch {
      alert("Status update failed");
    }
  };

  const deleteTask = async () => {
    const token = localStorage.getItem("token");
    if (!confirm("Delete this task?")) return;
    try {
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard");
    } catch {
      alert("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (!task) return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-full transition shadow-sm">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Task Editor</h1>
              <p className="text-slate-500 text-sm">Refine task details and deadlines</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
              >
                <Edit3 className="w-4 h-4" /> Edit Task
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition">
                  <X className="w-5 h-5" />
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>
        </header>

        {/* MAIN CARD */}
        <div className={`bg-white p-10 rounded-3xl border shadow-sm transition-all ${isOverdue ? "border-red-300" : "border-slate-200"}`}>
          
          {/* TITLE EDIT */}
          <div className="flex justify-between items-start mb-8">
            <div className="w-full mr-4">
              {isEditing ? (
                <input 
                  className="text-3xl font-black text-slate-900 w-full bg-slate-50 border-b-2 border-indigo-500 outline-none p-2 rounded-t-lg"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                />
              ) : (
                <h2 className="text-3xl font-black text-slate-900">{task.title}</h2>
              )}
            </div>
            <button onClick={deleteTask} className="text-slate-300 hover:text-red-500 transition p-2"><Trash2 className="w-5 h-5" /></button>
          </div>

          {/* GRID INFO */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <InfoCard label="Status" value={task.status} isEditing={isEditing}>
               <select 
                className="w-full bg-transparent font-bold text-slate-800 outline-none"
                value={editedTask.status}
                onChange={(e) => setEditedTask({...editedTask, status: e.target.value})}
               >
                 <option value="todo">Todo</option>
                 <option value="inprogress">In Progress</option>
                 <option value="done">Done</option>
               </select>
            </InfoCard>

            <InfoCard label="Priority" value={task.priority} isEditing={isEditing}>
               <select 
                className="w-full bg-transparent font-bold text-slate-800 outline-none"
                value={editedTask.priority}
                onChange={(e) => setEditedTask({...editedTask, priority: e.target.value})}
               >
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
               </select>
            </InfoCard>

            <InfoCard label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"} highlight={isOverdue} isEditing={isEditing}>
               <input 
                type="date"
                className="w-full bg-transparent font-bold text-slate-800 outline-none"
                value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ""}
                onChange={(e) => setEditedTask({...editedTask, dueDate: e.target.value})}
               />
            </InfoCard>
          </div>

          {/* DESCRIPTION */}
          <div className="pt-8 border-t border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
              Description
            </h3>
            {isEditing ? (
              <textarea 
                rows={5}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 leading-relaxed outline-none focus:ring-2 ring-indigo-500"
                value={editedTask.description}
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
              />
            ) : (
              <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
                {task.description || "No description provided."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, highlight, isEditing, children }: any) {
  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      highlight ? "border-red-200 bg-red-50" : "border-slate-100 bg-slate-50/50"
    } ${isEditing ? "ring-2 ring-indigo-500/20 bg-white border-indigo-200" : ""}`}>
      <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-2">
        {label}
      </p>
      <div className="text-slate-800 font-bold">
        {isEditing ? children : value.toUpperCase()}
      </div>
    </div>
  );
}