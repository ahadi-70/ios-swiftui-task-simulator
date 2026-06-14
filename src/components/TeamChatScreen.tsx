import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Message } from '../types';
import { Send, User, MessageSquare, Flame, Check, ShieldCheck, Share2, Plus } from 'lucide-react';

interface TeamChatScreenProps {
  tasks: Task[];
  messages: Message[];
  onSendMessage: (text: string, taskId?: string) => void;
  isDarkMode: boolean;
  onTriggerNotification: (title: string, body: string, type: 'alert' | 'reminder' | 'sync' | 'team') => void;
  onUpdateTask: (updatedTask: Task) => void;
}

export default function TeamChatScreen({
  tasks,
  messages,
  onSendMessage,
  isDarkMode,
  onTriggerNotification,
  onUpdateTask
}: TeamChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isTeammateTyping, setIsTeammateTyping] = useState<boolean>(false);
  const [typingTeammateName, setTypingTeammateName] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTeammateTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedTaskId) return;

    onSendMessage(inputText, selectedTaskId ? selectedTaskId : undefined);
    setInputText('');
    const taskIdSent = selectedTaskId;
    setSelectedTaskId('');

    // Trigger dynamic reply
    simulateTeammateResponse(inputText, taskIdSent);
  };

  const simulateTeammateResponse = (userText: string, attachedTaskId?: string) => {
    setIsTeammateTyping(true);
    const teammates = [
      { name: 'Sarah Connor', avatar: '👩‍💻' },
      { name: 'Jordan Miller', avatar: '👨‍🎨' },
      { name: 'Alex Rivera', avatar: '🧑‍💻' }
    ];
    const teammate = teammates[Math.floor(Math.random() * teammates.length)];
    setTypingTeammateName(teammate.name);

    setTimeout(() => {
      setIsTeammateTyping(false);
      let replyText = "Awesome! I am working on the iCloud push parameters now.";
      
      const lower = userText.toLowerCase();
      if (attachedTaskId) {
        const tObj = tasks.find(t => t.id === attachedTaskId);
        replyText = `Got the task: "${tObj?.title || 'Shared Task'}". I'll review this and update the priority to High if needed. Let's align on next steps!`;
        
        // Auto-complete or update task to simulate team collaboration!
        if (tObj && !tObj.isCompleted) {
          setTimeout(() => {
            const updated = { ...tObj, assignee: teammate.name, lastModified: Date.now() };
            onUpdateTask(updated);
            onTriggerNotification(
              "Task Assigned",
              `${teammate.name} claimed task "${tObj.title}"`,
              "team"
            );
          }, 3000);
        }
      } else if (lower.includes('status') || lower.includes('update') || lower.includes('progress')) {
        replyText = "All systems green. Devices A and B are fully synced in iCloud, let's ship this SwiftUI update tonight!";
      } else if (lower.includes('design') || lower.includes('css') || lower.includes('swiftui')) {
        replyText = "The iOS 17 SwiftUI layout looks really slick. Reordering by drags works perfectly.";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        replyText = "Hey! Let me know if you need help testing the offline synchronization queued states.";
      }

      onSendMessage(`[TEAM:${teammate.name}:${teammate.avatar}] ${replyText}`);
      
      // Send a push notification banner
      onTriggerNotification(
        teammate.name,
        replyText,
        'team'
      );
    }, 2200);
  };

  const handleShareTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 rounded-b-[40px] overflow-hidden" id="built-in-messaging">
      {/* Active Teammates Ribbon */}
      <div className="flex items-center justify-between p-3 px-4 bg-white dark:bg-zinc-900 border-b border-slate-150 dark:border-zinc-850">
        <div className="flex items-center gap-1.5">
          <MessageSquare size={16} className="text-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
            SwiftUI Team Collab
          </span>
        </div>
        <div className="flex items-center -space-x-1.5">
          <span className="w-6 h-6 rounded-full bg-indigo-500 text-xs flex items-center justify-center text-white ring-2 ring-white dark:ring-zinc-900 cursor-help" title="Sarah">👩‍💻</span>
          <span className="w-6 h-6 rounded-full bg-amber-500 text-xs flex items-center justify-center text-white ring-2 ring-white dark:ring-zinc-900 cursor-help" title="Jordan">👨‍🎨</span>
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-xs flex items-center justify-center text-white ring-2 ring-white dark:ring-zinc-900 cursor-help" title="Alex">🧑‍💻</span>
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900 translate-x-1 translate-y-2 z-10 scale-90" />
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col scrollbar-thin scrollbar-thumb-rounded">
        <div className="text-center my-1">
          <span className="text-[10px] bg-slate-200/50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 px-2.5 py-0.5 rounded-full font-mono">
            🔐 CloudKit Encrypted Channel
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = !msg.isTeammate;
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                isUser ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              {!isUser && (
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium mb-0.5 ml-8 flex items-center gap-1">
                  {msg.senderName}
                </span>
              )}
              <div className="flex items-start gap-2">
                {!isUser && (
                  <span className="w-6 h-6 bg-slate-250 dark:bg-zinc-800 rounded-full text-xs flex items-center justify-center">
                    {msg.senderAvatar}
                  </span>
                )}
                <div className="flex flex-col">
                  <div
                    className={`p-3 rounded-2xl text-[12px] leading-snug ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm shadow-blue-500/10'
                        : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 rounded-tl-none border border-slate-100 dark:border-zinc-850'
                    }`}
                  >
                    {/* Render attachment if any */}
                    {msg.taskId && (
                      <div className="mb-2 p-2 bg-slate-100/10 dark:bg-zinc-950/40 rounded-xl border border-white/10 flex flex-col">
                        <span className="text-[9px] uppercase tracking-wide font-bold opacity-80 mb-0.5">Linked Task</span>
                        <span className="font-semibold text-[11px] truncate">{tasks.find(t => t.id === msg.taskId)?.title || 'Task Details'}</span>
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
                          <span className="text-[8px] bg-white/20 px-1 rounded font-bold uppercase">{tasks.find(t => t.id === msg.taskId)?.priority}</span>
                          <span className="text-[9px] opacity-70">
                            {tasks.find(t => t.id === msg.taskId)?.isCompleted ? "✅ Done" : "⏳ Active"}
                          </span>
                        </div>
                      </div>
                    )}
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-400 dark:text-zinc-500 mt-0.5 px-1 flex items-center gap-0.5 font-mono">
                    {msg.timestamp}
                    {isUser && <Check size={8} className="text-blue-500" />}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Bubble */}
        <AnimatePresence>
          {isTeammateTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 max-w-[80%]"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-xs animate-bounce">
                💬
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-2.5 px-3.5 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                <span className="text-[10px] text-zinc-500 font-medium mr-1">{typingTeammateName} represents:</span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Attach Task Selection Pill if active */}
      {selectedTaskId && (
        <div className="px-4 py-1.5 bg-blue-500/10 dark:bg-blue-600/10 border-t border-blue-500/15 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="truncate">Attaching: <b>{tasks.find(t => t.id === selectedTaskId)?.title}</b></span>
          </div>
          <button 
            onClick={() => setSelectedTaskId('')}
            className="text-xs hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Message Typing Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-slate-150 dark:border-zinc-850 flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 active:scale-90 transition-all cursor-pointer"
            title="Attach a Task"
            onClick={() => {
              const pending = tasks.filter(t => !t.isCompleted);
              if (pending.length > 0) {
                setSelectedTaskId(pending[0].id);
              }
            }}
          >
            <Plus size={18} className="text-blue-500" />
          </button>
        </div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={selectedTaskId ? "Type comments and press Send..." : "Type iMessage..."}
          className="flex-1 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder-slate-450 dark:placeholder-zinc-500 text-[12px] p-2.5 px-4 rounded-full border border-transparent focus:border-blue-500 focus:outline-none transition-all"
        />
        <button
          type="submit"
          className="p-2.5 bg-blue-500 dark:bg-blue-600 rounded-full text-white shadow-md hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
