import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';
import { 
  Plus, Search, Filter, Calendar, AlertCircle, RefreshCw, Trash2, 
  Tag as TagIcon, Check, Circle, User, Share2, ArrowDownAZ,
  Download, FileSpreadsheet, Eye, ChevronRight, Share, CheckCircle2, RotateCcw
} from 'lucide-react';
import { formatDate, formatTime, exportToCSV, playSound } from '../utils';

interface TaskScreenProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'order' | 'lastModified'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (reordered: Task[]) => void;
  isDarkMode: boolean;
  onTriggerNotification: (title: string, body: string, type: 'alert' | 'reminder' | 'sync' | 'team') => void;
}

export default function TaskScreen({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  isDarkMode,
  onTriggerNotification
}: TaskScreenProps) {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [showShareSheet, setShowShareSheet] = useState<Task | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().slice(0, 16));
  const [formPriority, setFormPriority] = useState<Task['priority']>('Medium');
  const [formCategory, setFormCategory] = useState<Task['category']>('Work');
  const [formRecurring, setFormRecurring] = useState<Task['recurringInterval']>('none');
  const [formTags, setFormTags] = useState<string>('');
  const [formAssignee, setFormAssignee] = useState<string>('');

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Constants
  const categories = ['All', 'Work', 'Personal', 'Marketing', 'Development', 'Design'];

  // Handle Drag Events
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reorderedList = [...filteredTasks];
    const [draggedItem] = reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(targetIndex, 0, draggedItem);

    // Update global order attributes
    const updatedWithOrders = reorderedList.map((task, idx) => ({
      ...task,
      order: idx,
      lastModified: Date.now()
    }));
    
    // Map them back to the main array
    const result = tasks.map(t => {
      const updated = updatedWithOrders.find(u => u.id === t.id);
      return updated ? updated : t;
    });

    onReorderTasks(result);
    setDraggedIndex(null);
    onTriggerNotification(
      "iCloud Reorder Sync",
      "Task arrangement synchronized across simulated iCloud devices",
      "sync"
    );
  };

  // Filter Tasks
  const filteredTasks = [...tasks]
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => a.order - b.order);

  // Submit New Task
  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onAddTask({
      title: formTitle,
      notes: formNotes,
      dueDate: new Date(formDueDate).toISOString(),
      priority: formPriority,
      category: formCategory,
      isCompleted: false,
      tags: tagsArray,
      recurringInterval: formRecurring,
      assignee: formAssignee || undefined
    });

    // Clear form
    setFormTitle('');
    setFormNotes('');
    setFormDueDate(new Date().toISOString().slice(0, 16));
    setFormPriority('Medium');
    setFormCategory('Work');
    setFormRecurring('none');
    setFormTags('');
    setFormAssignee('');
    setIsNewTaskOpen(false);

    playSound('notify');
    onTriggerNotification(
      "Task Added Successfully",
      `"${formTitle}" is active. Notifications scheduled on upcoming deadlines.`,
      "alert"
    );
  };

  // Setup edit form
  const handleOpenEdit = (task: Task) => {
    setSelectedTaskForEdit(task);
    setFormTitle(task.title);
    setFormNotes(task.notes || '');
    setFormDueDate(new Date(task.dueDate).toISOString().slice(0, 16));
    setFormPriority(task.priority);
    setFormCategory(task.category);
    setFormRecurring(task.recurringInterval);
    setFormTags(task.tags.join(', '));
    setFormAssignee(task.assignee || '');
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForEdit || !formTitle.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const updated: Task = {
      ...selectedTaskForEdit,
      title: formTitle,
      notes: formNotes,
      dueDate: new Date(formDueDate).toISOString(),
      priority: formPriority,
      category: formCategory,
      recurringInterval: formRecurring,
      tags: tagsArray,
      assignee: formAssignee || undefined,
      lastModified: Date.now()
    };

    onUpdateTask(updated);
    setSelectedTaskForEdit(null);
    onTriggerNotification("Task Updated", `"${formTitle}" modifications were synced successfully`, "sync");
  };

  const getPriorityBadgeClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60';
      case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60';
      case 'Low': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 rounded-b-[40px] text-slate-800 dark:text-zinc-100 flex-1 relative overflow-hidden" id="swiftui-list-view">
      
      {/* Search Header */}
      <div className="p-4 pt-1 bg-white dark:bg-zinc-900 border-b border-slate-150 dark:border-zinc-850">
        <div className="relative mb-3 flex items-center bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 border border-slate-200/40 dark:border-zinc-800">
          <Search size={16} className="text-slate-400 dark:text-zinc-500 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, notes, or tags..."
            className="bg-transparent w-full focus:outline-none text-[13px] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500"
          />
        </div>

        {/* SwiftUI horizontal Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Workspace */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, index) => (
            <motion.div
              layoutId={task.id}
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-3.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-850 cursor-grab active:cursor-grabbing hover:shadow transition-all group flex gap-3 items-start relative ${
                task.isCompleted ? 'opacity-60 bg-slate-50/50 dark:bg-zinc-950/20' : ''
              }`}
              id={`task-${task.id}`}
            >
              {/* Checkbox Trigger */}
              <button 
                onClick={() => {
                  onUpdateTask({ ...task, isCompleted: !task.isCompleted, lastModified: Date.now() });
                  playSound(task.isCompleted ? 'click' : 'complete');
                  onTriggerNotification(
                    task.isCompleted ? "Task Active" : "Task Completed",
                    `"${task.title}" status successfully synchronized via iCloud`,
                    "sync"
                  );
                }}
                className="pt-0.5 shrink-0 hover:scale-110 active:scale-90 transition-all cursor-pointer"
                title={task.isCompleted ? "Mark incomplete" : "Mark as complete"}
              >
                {task.isCompleted ? (
                  <CheckCircle2 size={19} className="text-blue-500" />
                ) : (
                  <Circle size={19} className="text-slate-350 dark:text-zinc-650 hover:text-blue-500" />
                )}
              </button>

              {/* Task Core Text */}
              <div className="flex-1 min-w-0" onClick={() => handleOpenEdit(task)}>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className={`text-[13px] font-bold tracking-tight leading-tight truncate text-slate-800 dark:text-zinc-200 ${
                    task.isCompleted ? 'line-through text-slate-400 dark:text-zinc-500 font-normal' : ''
                  }`}>
                    {task.title}
                  </h4>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                {task.notes && (
                  <p className="text-[11px] text-slate-450 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-1.5">
                    {task.notes}
                  </p>
                )}

                {/* Tags and Metadata Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[9px] bg-slate-100 dark:bg-zinc-805 text-slate-500 dark:text-zinc-400 font-semibold px-2 py-0.5 rounded-full capitalize">
                    📁 {task.category}
                  </span>
                  
                  {task.recurringInterval !== 'none' && (
                    <span className="text-[9px] bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" title="Recurring Alert Frequency">
                      <RefreshCw size={10} className="animate-spin duration-3000" />
                      {task.recurringInterval}
                    </span>
                  )}

                  {task.assignee && (
                    <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <User size={10} />
                      {task.assignee.split(' ')[0]}
                    </span>
                  )}

                  {task.tags.map(tag => (
                    <span key={tag} className="text-[9px] bg-blue-500/10 text-blue-500 font-medium px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Deadline Info */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-zinc-500 mt-2 pt-1 border-t border-slate-100/50 dark:border-zinc-850">
                  <Calendar size={11} />
                  <span>{formatDate(task.dueDate)} at {formatTime(task.dueDate)}</span>
                </div>
              </div>

              {/* Slide Side actions handles & drags indicator */}
              <div className="flex flex-col gap-2 shrink-0 items-end self-stretch justify-between">
                {/* Drag Reorder Indicator */}
                <div className="text-slate-300 dark:text-zinc-700 select-none cursor-grab" title="Drag to reorder tasks">
                  <div className="grid grid-cols-2 gap-0.5 w-3">
                    <span className="w-1 h-1 bg-current rounded-full" />
                    <span className="w-1 h-1 bg-current rounded-full" />
                    <span className="w-1 h-1 bg-current rounded-full" />
                    <span className="w-1 h-1 bg-current rounded-full" />
                    <span className="w-1 h-1 bg-current rounded-full" />
                    <span className="w-1 h-1 bg-current rounded-full" />
                  </div>
                </div>

                {/* Mini utility actions */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity">
                  <button 
                    onClick={() => setShowShareSheet(task)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-blue-500 rounded transition-colors cursor-pointer"
                    title="Collaborative Share"
                  >
                    <Share2 size={12} />
                  </button>
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-rose-950/20 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-zinc-500 py-16">
            <CheckCircle2 size={40} className="text-emerald-400 mb-2 animate-bounce" />
            <h5 className="font-bold text-[14px]">No Tasks Found</h5>
            <p className="text-[11px] mt-1 max-w-[200px]">
              Configure filters or click "+" to record a new task with icloud replication.
            </p>
          </div>
        )}
      </div>

      {/* Direct Add Floating Task Button (SwiftUI style) */}
      <button
        onClick={() => setIsNewTaskOpen(true)}
        className="absolute bottom-6 right-6 w-12 h-12 bg-blue-500/90 dark:bg-blue-600/90 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 hover:bg-blue-600 active:scale-95 transition-all cursor-pointer ring-4 ring-white/10 backdrop-blur-sm z-30"
        title="Add New SwiftUI Task"
        id="ios-add-button"
      >
        <Plus size={24} />
      </button>

      {/* MODAL 1: ADD NEW TASK SHEET */}
      <AnimatePresence>
        {isNewTaskOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-end z-[40] p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white dark:bg-zinc-900 w-full rounded-t-[32px] p-5 shadow-2xl border-t border-slate-200 dark:border-zinc-800 flex flex-col max-h-[92%] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-zinc-850">
                <h3 className="text-[15px] font-extrabold tracking-tight">New SwiftUI Task</h3>
                <button 
                  onClick={() => setIsNewTaskOpen(false)}
                  className="text-xs text-blue-500 font-bold hover:underline"
                >
                  Cancel
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmitTask} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Design SwiftUI Widget"
                    className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Details or step list..."
                    rows={2}
                    className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Task['category'])}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as Task['priority'])}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Deadline Date</label>
                    <input
                      type="datetime-local"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Recurring Alert</label>
                    <select
                      value={formRecurring}
                      onChange={(e) => setFormRecurring(e.target.value as Task['recurringInterval'])}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="none">None (One Time)</option>
                      <option value="daily">Daily Reminder</option>
                      <option value="weekly">Weekly Reminder</option>
                      <option value="monthly">Monthly Reminder</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Tags (comma split)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="e.g. dev, presentation"
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Assignee (optional)</label>
                    <select
                      value={formAssignee}
                      onChange={(e) => setFormAssignee(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="">Keep Unassigned</option>
                      <option value="Sarah Connor">Sarah Connor (Developer)</option>
                      <option value="Jordan Miller">Jordan Miller (Designer)</option>
                      <option value="Alex Rivera">Alex Rivera (Product Manager)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[98%] text-white p-3 rounded-xl font-bold transition-all shadow-md mt-4 cursor-pointer text-center text-xs"
                >
                  Save to iCloud Database
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT TASK SHEET */}
      <AnimatePresence>
        {selectedTaskForEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-end z-[40] p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white dark:bg-zinc-900 w-full rounded-t-[32px] p-5 shadow-2xl border-t border-slate-200 dark:border-zinc-800 flex flex-col max-h-[92%] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-105 dark:border-zinc-850">
                <h3 className="text-[15px] font-extrabold tracking-tight">Edit Task Details</h3>
                <button 
                  onClick={() => setSelectedTaskForEdit(null)}
                  className="text-xs text-blue-500 font-bold hover:underline"
                >
                  Dismiss
                </button>
              </div>

              {/* Form Body for Edit */}
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Task['category'])}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-805 text-xs focus:outline-none"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as Task['priority'])}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-805 text-xs focus:outline-none"
                    >
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Deadline Date</label>
                    <input
                      type="datetime-local"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-808 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Recurring Alert</label>
                    <select
                      value={formRecurring}
                      onChange={(e) => setFormRecurring(e.target.value as Task['recurringInterval'])}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-808 text-xs focus:outline-none"
                    >
                      <option value="none">None (One Time)</option>
                      <option value="daily">Daily Reminder</option>
                      <option value="weekly">Weekly Reminder</option>
                      <option value="monthly">Monthly Reminder</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Tags (Comma Sep)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-808 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 font-bold uppercase mb-1">Assignee</label>
                    <select
                      value={formAssignee}
                      onChange={(e) => setFormAssignee(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl text-slate-808 text-xs focus:outline-none"
                    >
                      <option value="">None (Unassigned)</option>
                      <option value="Sarah Connor">Sarah Connor (Developer)</option>
                      <option value="Jordan Miller">Jordan Miller (Designer)</option>
                      <option value="Alex Rivera">Alex Rivera (Product Manager)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white p-3 rounded-xl font-bold transition-all shadow cursor-pointer text-center"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteTask(selectedTaskForEdit.id);
                      setSelectedTaskForEdit(null);
                      onTriggerNotification("Task Deleted", "Removed task from private secure disk storage", "alert");
                    }}
                    className="bg-red-500 hover:bg-red-600 active:scale-95 text-white p-3 rounded-xl font-bold transition-all shadow cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: SHARE SHEET (AirDrop / Copy Link Simulation) */}
      <AnimatePresence>
        {showShareSheet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-end z-[45] p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 w-full rounded-2xl p-5 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[13px] font-bold tracking-tight text-slate-850">iOS AirDrop / Collaborative Share</span>
                <button onClick={() => setShowShareSheet(null)} className="text-xs text-blue-500 font-bold cursor-pointer">Done</button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl mb-4 text-xs border border-slate-100 dark:border-zinc-850">
                <p className="font-semibold">{showShareSheet.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Assigned to: {showShareSheet.assignee || 'Everyone'}</p>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center text-[10px] mb-2">
                <button 
                  onClick={() => {
                    onTriggerNotification("AirDrop Successful", "Copied node context to nearby simulator team logs", "sync");
                    setShowShareSheet(null);
                  }}
                  className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-lg">🌀</div>
                  <span className="font-semibold text-slate-600 dark:text-zinc-400">AirDrop</span>
                </button>
                <button 
                  onClick={() => {
                    onTriggerNotification("Messages Sent", "Disseminated collaborative URL context to Alex Rivera", "team");
                    setShowShareSheet(null);
                  }}
                  className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-lg">💬</div>
                  <span className="font-semibold text-slate-600 dark:text-zinc-400">Messages</span>
                </button>
                <button 
                  onClick={() => {
                    onTriggerNotification("Mail Dispatched", "CSV database schemas packed to Taylor", "sync");
                    setShowShareSheet(null);
                  }}
                  className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform"
                >
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 text-lg">✉️</div>
                  <span className="font-semibold text-slate-600 dark:text-zinc-400">Mail</span>
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/task/${showShareSheet.id}`);
                    onTriggerNotification("Copied", "Collaborative project URL saved to clipboard", "alert");
                    setShowShareSheet(null);
                  }}
                  className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-slate-500 text-lg">🔗</div>
                  <span className="font-semibold text-slate-600 dark:text-zinc-400">Copy URL</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
