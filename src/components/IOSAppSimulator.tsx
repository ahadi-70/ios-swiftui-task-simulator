import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Message, SyncLog, iOSNotification } from '../types';
import { playSound } from '../utils';
import { 
  Wifi, Signal, Battery, Layers, MessageSquare, ListTodo, Cloud, Lock, 
  Settings, CheckCircle2, AlertCircle, Sparkles, Inbox, RefreshCw, X
} from 'lucide-react';
import TaskScreen from './TaskScreen';
import HomeScreenWidget from './HomeScreenWidget';
import TeamChatScreen from './TeamChatScreen';
import LockScreen from './LockScreen';

interface IOSAppSimulatorProps {
  tasks: Task[];
  messages: Message[];
  activeDevice: string;
  isOnline: boolean;
  syncQueue: Task[];
  isLocked: boolean;
  isBiometricsEnabled: boolean;
  onUnlock: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'order' | 'lastModified'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (reordered: Task[]) => void;
  onSendMessage: (text: string, taskId?: string) => void;
  notifications: iOSNotification[];
  onDismissNotification: (id: string) => void;
  onTriggerNotification: (title: string, body: string, type: 'alert' | 'reminder' | 'sync' | 'team') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export default function IOSAppSimulator({
  tasks,
  messages,
  activeDevice,
  isOnline,
  syncQueue,
  isLocked,
  isBiometricsEnabled,
  onUnlock,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  onSendMessage,
  notifications,
  onDismissNotification,
  onTriggerNotification,
  isDarkMode,
  setIsDarkMode
}: IOSAppSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'widget' | 'team' | 'icloud'>('tasks');

  // Local device clock simulation
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const hoursStr = hours < 10 ? '0' + hours : hours;
      setCurrentTime(`${hoursStr}:${minutesStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  // Sync animation helper
  const [isSyncAnimating, setIsSyncAnimating] = useState(false);
  useEffect(() => {
    if (isOnline && syncQueue.length === 0) {
      setIsSyncAnimating(true);
      const timer = setTimeout(() => setIsSyncAnimating(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [tasks, isOnline]);

  const activeDeviceLabel = () => {
    switch(activeDevice) {
      case 'iphone': return 'iPhone 15 Pro';
      case 'ipad': return 'iPad Pro M4';
      case 'macbook': return 'MacBook Air M3';
      default: return 'iOS Simulator';
    }
  };

  return (
    <div className="w-full max-w-[380px] mx-auto select-none" id="iphone-bezel-wrapper">
      {/* 3D Physical iPhone Frame Container */}
      <div className="relative border-[10px] border-slate-900 dark:border-zinc-800 rounded-[56px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] aspect-[9/19.5] overflow-hidden bg-slate-100 dark:bg-zinc-950 flex flex-col ring-4 ring-offset-1 ring-slate-400/20">
        
        {/* PHYSICAL HARDWARE SPEAKER/DIAMOND GLASS HOLE (Dynamic Island Simulator) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 text-[10px] text-white">
          <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-800" />
          <AnimatePresence>
            {isSyncAnimating && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1 text-[8px] text-blue-400 font-semibold"
                title="Synchronizing iCloud record sets"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                <span>iCloud sync Successful</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="w-2.5 h-2.5 bg-blue-900 rounded-full border border-blue-800 shadow-inner" />
        </div>

        {/* Dynamic iOS Notification Banners overlay */}
        <div className="absolute top-11 inset-x-2 z-[60] space-y-1">
          <AnimatePresence>
            {notifications.slice(0, 2).map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ y: -60, scale: 0.9, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -60, scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-3 border border-slate-205/50 dark:border-zinc-800/50 shadow-lg flex items-start gap-2.5 cursor-pointer"
                onClick={() => onDismissNotification(notif.id)}
              >
                <div className="shrink-0 p-1.5 rounded-full bg-blue-500/10 text-blue-500 mt-0.5">
                  {notif.type === 'alert' && <AlertCircle size={15} />}
                  {notif.type === 'reminder' && <CheckCircle2 size={15} />}
                  {notif.type === 'sync' && <Cloud size={15} />}
                  {notif.type === 'team' && <MessageSquare size={15} />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11px] font-extrabold truncate text-slate-800 dark:text-zinc-200">
                      {notif.title}
                    </span>
                    <span className="text-[8px] text-slate-400 dark:text-zinc-500">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-650 dark:text-zinc-455 leading-tight line-clamp-2">
                    {notif.body}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismissNotification(notif.id);
                  }}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 rounded cursor-pointer shrink-0"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 1. SECURE BIOMETRIC LOCK SCREEN VIEW */}
        <AnimatePresence mode="wait">
          {isLocked && isBiometricsEnabled ? (
            <motion.div 
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -200 }}
              className="absolute inset-0 z-[100]"
            >
              <LockScreen onUnlock={onUnlock} isDarkMode={isDarkMode} />
            </motion.div>
          ) : (
            <motion.div 
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              
              {/* TOP VIRTUAL iOS STATUS BAR */}
              <div className="flex justify-between items-center px-6 pt-3 pb-1 h-10 select-none bg-white dark:bg-zinc-900 border-b border-slate-100/50 dark:border-zinc-900/50 shrink-0">
                <span className="text-[12px] font-bold text-slate-700 dark:text-zinc-200">{currentTime}</span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-200">
                  <Signal size={12} />
                  <span className="text-[10px] font-extrabold uppercase">5G</span>
                  <div className={`p-0.5 rounded-sm ${isOnline ? 'text-blue-500' : 'text-slate-400'}`}>
                    <Wifi size={12} />
                  </div>
                  <Battery size={16} className="text-slate-805" />
                </div>
              </div>

              {/* SYSTEM LARGE APPLE NAVIGATION TITLE BAR */}
              <div className="bg-white dark:bg-zinc-900 px-4 py-2 border-b border-slate-150 dark:border-zinc-850 flex justify-between items-baseline shrink-0">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] tracking-wider font-extrabold uppercase bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                      iCloud Active
                    </span>
                    {!isOnline && (
                      <span className="text-[8px] tracking-wider font-extrabold uppercase bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded animate-pulse">
                        Offline
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mt-1 capitalize flex items-center gap-1.5">
                    {activeTab === 'tasks' && 'All Deadlines'}
                    {activeTab === 'widget' && 'Ext. Widget'}
                    {activeTab === 'team' && 'Messages'}
                    {activeTab === 'icloud' && 'iCloud Node'}
                  </h1>
                </div>

                {/* Dark Mode System Trigger button */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-650 dark:text-zinc-300 rounded-full transition-colors active:scale-90 cursor-pointer"
                  title="Force simulated App theme"
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
              </div>

              {/* 2. CORE RENDER VIEW ACCORDING TO TABS */}
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {activeTab === 'tasks' && (
                    <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                      <TaskScreen
                        tasks={tasks}
                        onAddTask={onAddTask}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                        onReorderTasks={onReorderTasks}
                        isDarkMode={isDarkMode}
                        onTriggerNotification={onTriggerNotification}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'widget' && (
                    <motion.div key="widget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-4 overflow-y-auto">
                      <HomeScreenWidget
                        tasks={tasks}
                        onCompleteTask={(id) => {
                          const matching = tasks.find(t => t.id === id);
                          if (matching) {
                            const nextCompleted = !matching.isCompleted;
                            onUpdateTask({ ...matching, isCompleted: nextCompleted, lastModified: Date.now() });
                            playSound(nextCompleted ? 'complete' : 'click');
                          }
                        }}
                        isDarkMode={isDarkMode}
                        onAddTaskClick={() => {
                          setActiveTab('tasks');
                          // Simple delay to let tab switch then click trigger is easy
                        }}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'team' && (
                    <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                      <TeamChatScreen
                        tasks={tasks}
                        messages={messages}
                        onSendMessage={onSendMessage}
                        isDarkMode={isDarkMode}
                        onTriggerNotification={onTriggerNotification}
                        onUpdateTask={onUpdateTask}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'icloud' && (
                    <motion.div key="icloud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-4 overflow-y-auto text-xs space-y-4">
                      
                      {/* Sync Metrics panel */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-4 rounded-3xl shadow-sm text-center">
                        <Cloud size={32} className="mx-auto text-blue-500 mb-1.5 animate-pulse" />
                        <h4 className="font-extrabold text-[13px]">CloudKit Storage Layer</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 max-w-[240px] mx-auto">
                          Synchronizing with security keys on secure cloud disks. Devices match state instantly.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-left font-semibold">
                          <div className="bg-slate-50 dark:bg-zinc-950 p-2 rounded-xl border border-slate-100 dark:border-zinc-900">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Unsynced Queue</span>
                            <span className="text-xs text-slate-800 dark:text-zinc-200">{syncQueue.length} records</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-zinc-950 p-2 rounded-xl border border-slate-100 dark:border-zinc-900">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Hardware Active</span>
                            <span className="text-xs text-slate-800 dark:text-zinc-200">{activeDeviceLabel()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Device synchronicity grid */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-4 rounded-3xl shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-850 pb-1.5">
                          <span className="font-bold tracking-tight text-[12px]">Device Register Status</span>
                          <span className="text-[9px] text-emerald-500 font-bold uppercase">Online Hub</span>
                        </div>
                        {[
                          { name: 'iPhone 15 Pro (This)', power: 'Active', latency: '4ms', isMe: activeDevice === 'iphone' },
                          { name: 'iPad Pro M4', power: 'Listening', latency: '12ms', isMe: activeDevice === 'ipad' },
                          { name: 'MacBook Air M3', power: 'Sync-Idle', latency: '15ms', isMe: activeDevice === 'macbook' }
                        ].map(dev => (
                          <div key={dev.name} className="flex justify-between items-center">
                            <span className={`text-[11px] font-medium ${dev.isMe ? 'text-blue-500 font-bold' : ''}`}>
                              {dev.name} {dev.isMe && '•'}
                            </span>
                            <div className="flex gap-2 text-[10px] text-zinc-500 text-right">
                              <span>{dev.power}</span>
                              <span className="font-mono">{dev.latency}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cloud settings summary */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-4 rounded-3xl shadow-sm space-y-2">
                        <span className="font-bold tracking-tight text-[11px] uppercase tracking-wider text-slate-500">iCloud Settings</span>
                        <div className="flex justify-between items-center py-1">
                          <span>Enable Offline Queueing</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Enabled</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>Secure FileVault Keys</span>
                          <span className="text-[10px] text-emerald-500 font-bold uppercase">Verified</span>
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* TAB BAR NAVIGATION CONTROLLS (SwiftUI layout styles) */}
              <div className="bg-white dark:bg-gray-900 border-t border-slate-200/60 dark:border-zinc-850 shadow-inner px-4 py-2 pb-5 flex justify-between shrink-0">
                {[
                  { id: 'tasks', label: 'Tasks', icon: ListTodo },
                  { id: 'widget', label: 'Widget', icon: Layers },
                  { id: 'team', label: 'Team', icon: MessageSquare },
                  { id: 'icloud', label: 'iCloud', icon: Cloud }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        playSound('click');
                      }}
                      className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer py-1 ${
                        isActive 
                          ? 'text-blue-500 scale-105' 
                          : 'text-slate-400 dark:text-zinc-500 hover:text-slate-650'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                      <span className="text-[9px] font-bold tracking-wider">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Native iOS Bottom slide pointer bar */}
              <div className="h-1 bg-slate-900 dark:bg-white w-28 mx-auto rounded-full mb-1 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
