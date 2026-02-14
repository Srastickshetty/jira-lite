"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import TaskModal from "@/components/TaskModal";
import confetti from "canvas-confetti";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCcw, Plus, Trash2, Calendar, AlignLeft, CheckCircle2 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  subtasks?: any[];
  createdAt?: string;
  dueDate?: string;
}
interface EmployeeDashboardProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "employee";
  };
}

export default function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDescription, setShowDescription] = useState(false);

  const statuses = ["todo", "inprogress", "done"];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    try {
      const res = await axios.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) { 
      toast.error("Failed to load tasks");
    }
  }, [router]);

  

  useEffect(() => { 
    fetchTasks(); 
     
  }, [fetchTasks]);

  const triggerCelebrate = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#000000", "#3b82f6", "#10b981"],
    });
  };

  const createTask = async () => {
    if (!title.trim()) return;
    setIsCreating(true);
    const loadingToast = toast.loading("Creating task..."); 
    
    try {
      await axios.post("/api/tasks", 
        { title, description, priority, status: "todo", dueDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setTitle(""); 
      setDescription(""); 
      setPriority("medium"); 
      setDueDate("");
      setShowDescription(false);
      
      toast.success("Task added to pipeline!", { id: loadingToast });
      fetchTasks();
    } catch (err) {
      toast.error("Could not create task", { id: loadingToast });
    } finally { 
      setIsCreating(false); 
    }
  };

  const deleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this task?")) return;
    
    try {
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(tasks.filter(t => t._id !== id));
      toast.success("Task deleted");
    } catch (err) { 
      toast.error("Delete failed");
      fetchTasks(); 
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, status: destination.droppableId } : t
    );
    setTasks(updatedTasks);

    if (destination.droppableId === "done" && source.droppableId !== "done") {
      triggerCelebrate();
      toast.success("Excellent work!", { icon: "🎉" });
    }

    try {
      await axios.patch(`/api/tasks/${draggableId}`, 
        { status: destination.droppableId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch (err) { 
      toast.error("Sync failed");
      setTasks(originalTasks); 
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {getGreeting()}, {user?.name || "User"}
            </h1>
            <p className="text-zinc-500 mt-2">Here’s your task overview for today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{user?.role || "Employee"}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <button onClick={() => { localStorage.removeItem("token"); router.push("/"); }} className="text-sm font-bold bg-zinc-900 text-white px-5 py-2.5 rounded-xl hover:bg-zinc-700 transition">Sign out</button>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StatCard label="Pipeline" value={tasks.filter(t => t.status === "todo").length} trend="incoming" />
          <StatCard label="In Progress" value={tasks.filter(t => t.status === "inprogress").length} trend="Active" color="blue" />
          <StatCard label="Completed" value={tasks.filter(t => t.status === "done").length} trend="Total" color="emerald" />
        </div>

        {/* QUICK-ADD BOX */}
        <div className="bg-white border border-zinc-200/60 rounded-3xl mb-16 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all overflow-hidden">
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row items-center gap-2 p-2">
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 bg-transparent px-6 py-4 outline-none text-sm font-medium"
                onKeyDown={(e) => e.key === 'Enter' && createTask()}
              />
              
              <div className="flex flex-wrap items-center gap-2 pr-2 w-full md:w-auto p-2">
                <button 
                  onClick={() => setShowDescription(!showDescription)}
                  className={`p-3 rounded-2xl transition-colors flex items-center gap-2 text-xs font-bold ${showDescription ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
                >
                  <AlignLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{showDescription ? "Hide Details" : "Add Details"}</span>
                </button>

                <div className="flex items-center bg-zinc-50 rounded-2xl px-3 border border-transparent focus-within:border-zinc-200">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 mr-2" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-transparent text-xs font-bold py-3 outline-none cursor-pointer"
                  />
                </div>

                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="bg-zinc-50 text-xs font-bold uppercase px-4 py-3 rounded-2xl outline-none hover:bg-zinc-100 transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <button 
                  onClick={createTask}
                  disabled={isCreating || !title}
                  className="bg-zinc-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isCreating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isCreating ? "Adding..." : "Add Task"}</span>
                </button>
              </div>
            </div>

            {showDescription && (
              <div className="px-8 pb-6 pt-2 border-t border-zinc-100">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block">Task Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elaborate on the task objectives..."
                  className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm outline-none focus:bg-white focus:border-zinc-200 transition-all min-h-[100px] resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* KANBAN BOARD */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {statuses.map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`rounded-3xl p-2 transition-colors min-h-[500px] ${snapshot.isDraggingOver ? "bg-zinc-100/50" : ""}`}>
                    <div className="flex items-center justify-between px-4 mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">{status}</h3>
                      <span className="w-6 h-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold">
                        {filteredTasks.filter(t => t.status === status).length}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {filteredTasks
                        .filter((task) => task.status === status)
                        .sort((a, b) => new Date(a.dueDate || "9999-12-31").getTime() - new Date(b.dueDate || "9999-12-31").getTime())
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedTask(task)}
                                className={`group bg-white p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                                  task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0)) && task.status !== "done"
                                    ? "border-rose-200 shadow-sm"
                                    : "border-transparent"
                                } ${snapshot.isDragging ? "shadow-2xl scale-105 rotate-2" : "hover:shadow-xl hover:-translate-y-1 shadow-sm"}`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                                    task.priority === "high" ? "bg-rose-50 text-rose-600" :
                                    task.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                  }`}>
                                    {task.priority}
                                  </div>
                                  <button onClick={(e) => deleteTask(task._id, e)} className="p-2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-600 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <h4 className="text-[15px] font-semibold text-zinc-800 leading-tight mb-2">{task.title}</h4>
                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">{task.description}</p>
                                
                                {/* 🔥 CHECKLIST PROGRESS VISIBLE HERE */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <SubtaskProgress subtasks={task.subtasks} />
                                )}

                                {task.dueDate && (
                                  <div className="mt-4">
                                    <DueDateBadge date={task.dueDate} />
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        {selectedTask && (
          <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} refresh={fetchTasks} />
        )}
      </div>
    </div>
  );
}

// 🔥 NEW COMPONENT FOR SUBTASK PROGRESS
function SubtaskProgress({ subtasks }: { subtasks: any[] }) {
  const total = subtasks.length;
  const completed = subtasks.filter(s => s.completed).length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400 tracking-wider">
        <div className="flex items-center gap-1">
          <CheckCircle2 className={`w-3 h-3 ${percentage === 100 ? 'text-emerald-500' : 'text-zinc-300'}`} />
          <span>Checklist</span>
        </div>
        <span>{completed}/{total}</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-emerald-500' : 'bg-zinc-800'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function DueDateBadge({ date }: { date: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const isToday = due.getTime() === today.getTime();
  const isOverdue = due < today;

  return (
    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${
        isOverdue ? "bg-rose-50 text-rose-600" : 
        isToday ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? "bg-rose-500" : isToday ? "bg-amber-500" : "bg-zinc-400"}`} />
      {isOverdue ? "Overdue" : isToday ? "Due Today" : `Due ${new Date(date).toLocaleDateString()}`}
    </span>
  );
}

function StatCard({ label, value, trend, color = "zinc" }: any) {
  const colorStyles: any = {
    zinc: "text-zinc-900 bg-zinc-100",
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };
  return (
    <div className="bg-white border border-zinc-200/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</p>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${colorStyles[color]}`}>{trend}</span>
        </div>
        <h2 className="text-5xl font-black tracking-tighter">{value}</h2>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
    </div>
  );
}