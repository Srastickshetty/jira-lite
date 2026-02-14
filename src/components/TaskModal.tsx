"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Check, Send, Loader2, X, ListTodo, MessageSquare, Flame, BarChart3, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

interface Subtask {
  title: string;
  completed: boolean;
}

interface Props {
  task: any;
  onClose: () => void;
  refresh: () => void;
}

export default function TaskModal({ task, onClose, refresh }: Props) {
  const [mounted, setMounted] = useState(false);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [description, setDescription] = useState(task.description || ""); // 🔥 Description state
  const [comments, setComments] = useState(task.comments || []);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");
  
  const [isPosting, setIsPosting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSavingDesc, setIsSavingDesc] = useState(false); // 🔥 Saving indicator

  useEffect(() => {
    setMounted(true);
    setStatus(task.status);
    setPriority(task.priority);
    setDescription(task.description || "");
    setComments(task.comments || []);
    setSubtasks(task.subtasks || []);
  }, [task]);

  if (!mounted) return null;

  const updateTask = async (updatedFields: any) => {
    try {
      await axios.patch(
        `/api/tasks/${task._id}`,
        updatedFields,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      refresh();
    } catch (error) {
      toast.error("Sync failed");
      console.error("Failed to update task", error);
    }
  };

  // 🔥 Update description specifically
  const handleDescriptionBlur = async () => {
    if (description === task.description) return;
    setIsSavingDesc(true);
    await updateTask({ description });
    setIsSavingDesc(false);
    toast.success("Description saved");
  };

  const updateStatus = (newStatus: string) => {
    setStatus(newStatus);
    updateTask({ status: newStatus });
    toast.success(`Moved to ${newStatus}`, { icon: '🚀', duration: 1000 });
  };

  const updatePriority = (newPriority: string) => {
    setPriority(newPriority);
    updateTask({ priority: newPriority });
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    const updated = [...subtasks, { title: newSubtask, completed: false }];
    setSubtasks(updated);
    setNewSubtask("");
    await updateTask({ subtasks: updated });
  };

  const toggleSubtask = async (index: number) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
    await updateTask({ subtasks: updated });
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setIsPosting(true);
    
    try {
      const updatedComments = [...comments, { text: comment, createdAt: new Date() }];
      await updateTask({ comments: updatedComments });
      
      setComments(updatedComments);
      setComment("");
      setSaveSuccess(true);
      
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      toast.error("Could not post comment");
    } finally {
      setIsPosting(false);
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progress = subtasks.length === 0 ? 0 : Math.round((completedCount / subtasks.length) * 100);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-[999999] p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[650px] max-h-[90vh] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${priority === 'high' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
               <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Task Detail</span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{task.title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Current Path</label>
              <select
                value={status}
                onChange={(e) => updateStatus(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="todo">🎯 To Do</option>
                <option value="inprogress">⚡ In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => updatePriority(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition-all appearance-none cursor-pointer ${
                  priority === "high" ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-slate-50 border-slate-100 text-slate-700"
                }`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority 🔥</option>
              </select>
            </div>
          </div>

          {/* DESCRIPTION (NOW EDITABLE) */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-black uppercase text-slate-800">Brief</h3>
              </div>
              {isSavingDesc && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
            </div>
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="No description provided. Click to add one..."
                className="w-full bg-slate-50 p-6 rounded-[20px] border border-slate-100 text-slate-600 leading-relaxed text-[15px] outline-none focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all min-h-[120px] resize-none"
              />
              <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>

          {/* SUBTASKS */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-black uppercase text-slate-800">Checklist</h3>
              </div>
              <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                {progress}% Complete
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }} 
              />
            </div>
            
            <div className="space-y-3 mb-4">
              {subtasks.map((sub, i) => (
                <div 
                    key={i} 
                    onClick={() => toggleSubtask(i)}
                    className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-200 transition-all group"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${sub.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                    {sub.completed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm font-medium transition-all ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Break it down..."
                className="flex-1 p-4 rounded-2xl border-2 border-slate-100 text-sm focus:border-indigo-500 outline-none transition-all"
                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
              />
              <button
                onClick={addSubtask}
                className="px-6 bg-slate-800 text-white rounded-2xl hover:bg-black transition-all font-bold text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* COMMENTS */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-black uppercase text-slate-800">
                Activity <span className="ml-2 text-[10px] bg-slate-100 px-2 py-1 rounded-full">{comments.length}</span>
              </h3>
            </div>

            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((c: any, i: number) => (
                  <div key={i} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px] font-bold">U</div>
                    <div className="flex-1 p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100">
                      <p className="text-sm text-slate-600">{c.text}</p>
                      <span className="text-[9px] font-bold text-slate-400 mt-2 block uppercase tracking-wider">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Just now"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-40">
                    <p className="text-xs font-bold uppercase tracking-widest">Quiet on the western front</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex gap-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your update..."
              disabled={isPosting}
              className="flex-1 p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 outline-none transition-all bg-white text-sm"
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
            />
            <button
              onClick={addComment}
              disabled={isPosting || !comment.trim()}
              className={`px-8 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
                saveSuccess 
                ? "bg-emerald-500 text-white shadow-emerald-200" 
                : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
              } disabled:opacity-50 disabled:shadow-none`}
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4 animate-bounce" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isPosting ? "Posting" : saveSuccess ? "Done" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}