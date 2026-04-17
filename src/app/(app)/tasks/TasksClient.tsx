"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
}

const Columns: { id: TaskStatus; title: string; color: string; icon: any }[] = [
  { id: "TODO", title: "To Do", color: "text-zinc-400 bg-zinc-500/10", icon: Clock },
  { id: "IN_PROGRESS", title: "In Progress", color: "text-blue-400 bg-blue-500/10", icon: Clock },
  { id: "REVIEW", title: "In Review", color: "text-amber-400 bg-amber-500/10", icon: AlertCircle },
  { id: "DONE", title: "Done", color: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle2 },
];

const priorityConfig = {
  LOW: { color: "bg-zinc-500/20 text-zinc-400" },
  MEDIUM: { color: "bg-blue-500/20 text-blue-400" },
  HIGH: { color: "bg-rose-500/20 text-rose-400" },
};

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "Today"
  });

  const handleCreateTask = () => {
    if (!newTask.title) return;
    setTasks([...tasks, { ...newTask, id: Math.random().toString() } as Task]);
    setIsAddTaskOpen(false);
    setNewTask({ title: "", description: "", status: "TODO", priority: "MEDIUM", dueDate: "Today" });
  };


  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTask(id);
    e.dataTransfer.setData("taskId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    }
    setDraggedTask(null);
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Team Tasks</h1>
          <p className="text-sm text-zinc-400">Manage and organize your team's workflow</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-64 rounded-full border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
          <button className="flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button 
            onClick={() => setIsAddTaskOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full min-w-max gap-6">
          {Columns.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            const Icon = col.icon;
            
            return (
              <div 
                key={col.id}
                className="flex h-full w-80 flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/30"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between p-4 mix-blend-plus-lighter">
                  <div className="flex items-center gap-2">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-md font-medium", col.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="font-semibold text-zinc-200">{col.title}</h3>
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => { setNewTask({...newTask, status: col.id}); setIsAddTaskOpen(true); }}
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-3 custom-scrollbar">
                  <AnimatePresence>
                    {columnTasks.map(task => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        key={task.id}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, task.id)}
                        className={cn(
                          "group cursor-grab active:cursor-grabbing flex flex-col gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700 hover:shadow-md",
                          draggedTask === task.id ? "opacity-50" : ""
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className={cn(
                            "flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider",
                            priorityConfig[task.priority].color
                          )}>
                            {task.priority}
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 rounded text-zinc-500 hover:text-zinc-300 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-zinc-100">{task.title}</h4>
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{task.description}</p>
                        </div>

                        <div className="mt-2 flex items-end justify-between border-t border-zinc-800/60 pt-3">
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{task.dueDate}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                            className="text-xs text-rose-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {columnTasks.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-zinc-800 text-sm text-zinc-600">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddTaskOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Create New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g. Update Documentation"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Add details about the task..."
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none resize-none custom-scrollbar"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Status</label>
                    <select
                      value={newTask.status}
                      onChange={e => setNewTask({...newTask, status: e.target.value as TaskStatus})}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      {Columns.map(col => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Due Date</label>
                  <input
                    type="text"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    placeholder="e.g. Apr 15, Tomorrow, Next Week"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.title}
                  className="flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #3f3f46;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #52525b;
        }
      `}} />
    </div>
  );
}
