import React, { useState, useEffect } from 'react';
import { Task, Message, SyncLog, iOSNotification } from './types';
import IOSAppSimulator from './components/IOSAppSimulator';
import SimulationControls from './components/SimulationControls';
import { 
  Laptop, Smartphone, Cloud, Settings, Wifi, CheckCircle2, 
  Trash2, RotateCcw, AlertTriangle, ShieldCheck, Mail, Share2, Printer
} from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Verify Apple Push Notification Token',
    notes: 'Renew the APNS certificate inside Apple Developer console to prevent warning alarms.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 hours from now
    priority: 'High',
    category: 'Development',
    isCompleted: false,
    order: 0,
    tags: ['apns', 'ios17'],
    recurringInterval: 'none',
    assignee: 'Sarah Connor',
    lastModified: Date.now()
  },
  {
    id: '2',
    title: 'Design SwiftUI Grid Widget layouts',
    notes: 'Draft small/medium/large iOS home screen widgets respecting Apple human guidelines.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
    priority: 'Medium',
    category: 'Design',
    isCompleted: false,
    order: 1,
    tags: ['swiftui', 'widget'],
    recurringInterval: 'weekly',
    assignee: 'Jordan Miller',
    lastModified: Date.now()
  },
  {
    id: '3',
    title: 'Setup CloudKit Private Database schemas',
    notes: 'Ensure task synchronization replicates accurately during offline/online toggles.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days from now
    priority: 'High',
    category: 'Development',
    isCompleted: false,
    order: 2,
    tags: ['icloud', 'security'],
    recurringInterval: 'daily',
    assignee: 'Alex Rivera',
    lastModified: Date.now()
  },
  {
    id: '4',
    title: 'Publish Q3 Product Roadmap draft',
    notes: 'Ensure correct CSV and backup logs are accessible for all marketing coordinators.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(), // 5 days from now
    priority: 'Low',
    category: 'Marketing',
    isCompleted: true,
    order: 3,
    tags: ['roadmap'],
    recurringInterval: 'none',
    lastModified: Date.now()
  }
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderName: 'Sarah Connor',
    senderAvatar: '👩‍💻',
    text: "Hey team! I completed the APNS setup profile. Let's make sure the interactive widget works on iPad Pro as well.",
    timestamp: '10:45 AM',
    isTeammate: true
  },
  {
    id: 'm2',
    senderName: 'Alex Rivera',
    senderAvatar: '🧑‍💻',
    text: 'Nice job! Reordering indices works really nicely with drag events now.',
    timestamp: '10:48 AM',
    isTeammate: true
  },
  {
    id: 'm3',
    senderName: 'Jordan Miller',
    senderAvatar: '👨‍🎨',
    text: "I uploaded the SwiftUI widget layouts. Give them a look in the 'Widget' simulator tab!",
    timestamp: '11:02 AM',
    isTeammate: true
  }
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ios_sim_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ios_sim_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<iOSNotification[]>([]);
  const [activeDevice, setActiveDevice] = useState<string>('iphone');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(true);
  
  // Local modifications queue for Offline synchronization
  const [syncQueue, setSyncQueue] = useState<Task[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  // Local storage management
  useEffect(() => {
    localStorage.setItem('ios_sim_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ios_sim_messages', JSON.stringify(messages));
  }, [messages]);

  // Log function helper
  const addSyncLog = (action: string, status: SyncLog['status']) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newLog: SyncLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: time,
      device: activeDevice,
      action,
      status
    };
    setSyncLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Populate first logs
  useEffect(() => {
    addSyncLog("CloudKit engine initialized", "success");
    addSyncLog("Initial load merged from iCloud Drive", "success");
  }, []);

  // Sync Queue handler when going back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      addSyncLog(`Syncing offline queue (${syncQueue.length} records)...`, "pending");
      
      const timer = setTimeout(() => {
        setSyncQueue([]);
        addSyncLog("All offline modifications pushed to CloudKit successfully!", "success");
        triggerNotification(
          "iCloud Sync Resolved",
          `Synced ${syncQueue.length} modifications with the cloud database.`,
          "sync"
        );
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isOnline, syncQueue]);

  // Trigger simulated push notification
  const triggerNotification = (
    title: string, 
    body: string, 
    type: 'alert' | 'reminder' | 'sync' | 'team'
  ) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newNotif: iOSNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      body,
      timestamp: time,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
    addSyncLog(`Push sent: "${title}"`, "success");
  };

  // Dismiss notification banner
  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Task Actions
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'order' | 'lastModified'>) => {
    const textId = Math.random().toString(36).substr(2, 9);
    const orderNum = tasks.length;
    const newTask: Task = {
      ...newTaskData,
      id: textId,
      order: orderNum,
      lastModified: Date.now()
    };

    setTasks(prev => [...prev, newTask]);

    if (isOnline) {
      addSyncLog(`Pushed task "${newTask.title}" to CloudKit`, "success");
    } else {
      setSyncQueue(prev => [...prev, newTask]);
      addSyncLog(`Queued task "${newTask.title}" locally`, "offline");
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    if (isOnline) {
      addSyncLog(`Uploaded changes to "${updatedTask.title}"`, "success");
    } else {
      // Avoid duplicating in queue if already exists
      setSyncQueue(prev => {
        const filtered = prev.filter(t => t.id !== updatedTask.id);
        return [...filtered, updatedTask];
      });
      addSyncLog(`Queued updates on "${updatedTask.title}" locally`, "offline");
    }
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));

    if (taskToDelete) {
      if (isOnline) {
        addSyncLog(`Deleted task "${taskToDelete.title}" from iCloud`, "success");
      } else {
        addSyncLog(`Queued deletion for "${taskToDelete.title}" locally`, "offline");
      }
    }
  };

  const handleReorderTasks = (reorderedList: Task[]) => {
    setTasks(reorderedList);
    addSyncLog("Interactive task order synchronized", "success");
  };

  // Messaging actions
  const handleSendMessage = (text: string, taskId?: string) => {
    // Check if it's teammate's message formatted from the chat screen component itself
    if (text.startsWith('[TEAM:')) {
      const parts = text.split('] ');
      const header = parts[0].replace('[TEAM:', '').split(':');
      const senderName = header[0];
      const senderAvatar = header[1];
      const actualText = parts.slice(1).join('] ');

      const newMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        senderName,
        senderAvatar,
        text: actualText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isTeammate: true
      };
      setMessages(prev => [...prev, newMsg]);
      addSyncLog(`Message received: "${senderName}"`, "success");
      return;
    }

    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: 'You (iCloud Hub)',
      senderAvatar: '🙋‍♂️',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isTeammate: false,
      taskId
    };

    setMessages(prev => [...prev, newMsg]);
    addSyncLog("Sent collaborative chat package", "success");
  };

  // Reset/Preload
  const handlePreload = () => {
    setTasks(INITIAL_TASKS);
    setMessages(INITIAL_MESSAGES);
    setSyncQueue([]);
    setSyncLogs([]);
    addSyncLog("Database re-synchronized with clean target snapshot", "success");
    triggerNotification(
      "Re-synchronized",
      "iCloud development container database populated with demo files.",
      "sync"
    );
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const strokeDashoffset = 364 - (completionPercentage / 100) * 364;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none">
      
      {/* Visual Navigation Banner: Styled as an elegant floating Bento Header Panel */}
      <header className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] m-4 md:m-6 max-w-7xl w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] mx-auto shrink-0 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="p-3.5 bg-[#0A84FF]/10 text-[#0A84FF] rounded-2xl border border-[#0A84FF]/20 shadow-inner">
              <Laptop size={24} className="animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 leading-none font-display text-white">
                iCloud SwiftUI Tasks Sandbox
                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider animate-pulse">
                  Bento Theme Active
                </span>
              </h1>
              <p className="text-xs text-[#8E8E93] mt-1 font-medium">
                iOS 17 Human Interface Guidelines • Secure Biometrics • CloudKit Sandbox Storage
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-[#2C2C2E] px-4 py-2 rounded-full border border-white/5 font-bold font-mono text-white/95 shadow-sm">
              <ShieldCheck size={14} className="text-[#30D158]" />
              <span>FaceID Key: 1717</span>
            </div>
            
            <button
              onClick={handlePreload}
              className="p-2.5 rounded-full bg-[#2C2C2E] border border-white/5 hover:border-white/10 hover:bg-[#3A3A3C] text-[#8E8E93] hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Reset Simulated Database Container"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20">
        
        {/* Left Side: Simulation Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <SimulationControls
            activeDevice={activeDevice}
            setActiveDevice={setActiveDevice}
            isOnline={isOnline}
            setIsOnline={setIsOnline}
            syncQueueLength={syncQueue.length}
            syncLogs={syncLogs}
            clearLogs={() => setSyncLogs([])}
            onTriggerNotification={triggerNotification}
            onPreloadSampleTasks={handlePreload}
            tasks={tasks}
            isBiometricsEnabled={isBiometricsEnabled}
            setIsBiometricsEnabled={setIsBiometricsEnabled}
            onLockDevice={() => setIsLocked(true)}
          />

          {/* Dynamic Bento Statistics Circle Card */}
          <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-white/10 transition-all group">
            <div className="w-full flex justify-between items-center px-1">
              <span className="text-xs font-extrabold text-[#8E8E93] uppercase tracking-widest font-display flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#30D158] rounded-full animate-pulse" />
                Live CloudKit Metrics
              </span>
              <span className="text-[10px] font-mono text-[#30D158] font-bold bg-[#30D158]/10 px-2.5 py-0.5 rounded-full uppercase">
                {totalCount > 0 && completedCount === totalCount ? 'All Synced' : 'Sync Active'}
              </span>
            </div>
            
            <div className="relative flex items-center justify-center my-2">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                <circle cx="72" cy="72" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-[#30D158] transition-all duration-1000 ease-out" strokeDasharray="364" strokeDashoffset={strokeDashoffset} />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black font-display text-white tracking-tight">{completionPercentage}%</span>
                <p className="text-[9px] text-[#8E8E93] font-black uppercase tracking-widest mt-0.5">Goal Rate</p>
              </div>
            </div>
            
            <div className="text-center font-sans">
              <p className="text-sm font-bold text-white/90 font-display">
                {completedCount} of {totalCount} Tasks Finished
              </p>
              <p className="text-[11px] text-[#8E8E93] mt-1 leading-relaxed max-w-[280px]">
                Replicated state updates instant physical iCloud and SwiftUI Home Screen Widgets in real-time.
              </p>
            </div>
          </div>

          {/* iOS Backup Spec Sheet - Redesigned as a pristine Category Bento Filter Card */}
          <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-[2rem] space-y-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-extrabold text-[#8E8E93] flex items-center gap-2 uppercase tracking-widest font-display">
                <Printer size={14} className="text-[#BF5AF2]" />
                Developer Spec Sheet & Categories
              </span>
              <span className="text-[10px] bg-[#3A3A3C] border border-white/5 px-2.5 py-0.5 rounded-md text-[#0A84FF] font-black font-mono">
                {tasks.length} SYNCED
              </span>
            </div>
            
            {/* Bento Categories visual decoration from design HTML */}
            <div className="space-y-3">
              <h4 className="text-[10px] mx-0.5 text-[#8E8E93] font-bold uppercase tracking-widest block">Active iCloud Containers</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3.5 py-1.5 bg-[#0A84FF] text-white rounded-full text-[10px] font-bold shadow-md">#AllTasks</span>
                <span className="px-3.5 py-1.5 bg-[#2C2C2E] text-white/70 rounded-full text-[10px] font-medium border border-white/5">#Work</span>
                <span className="px-3.5 py-1.5 bg-[#2C2C2E] text-white/70 rounded-full text-[10px] font-medium border border-white/5">#Personal</span>
                <span className="px-3.5 py-1.5 bg-[#2C2C2E] text-white/70 rounded-full text-[10px] font-medium border border-white/5">#Marketing</span>
                <span className="px-3.5 py-1.5 bg-[#2C2C2E] text-white/70 rounded-full text-[10px] font-medium border border-white/5">#Development</span>
                <span className="px-3.5 py-1.5 bg-[#2C2C2E] text-white/70 rounded-full text-[10px] font-medium border border-white/5">#Design</span>
              </div>
            </div>

            <div className="bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-2xl p-4 transition-all">
              <p className="text-[#FF9F0A] text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                <Cloud size={14} />
                Offline Replication Ready
              </p>
              <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                Database is synced & ready for offline use. Command + P loads standard export stylesheets.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Physical iPhone Device Simulator (7 cols) */}
        <div className="lg:col-span-7 flex justify-center items-center py-4 relative">
          
          {/* Decorative glowing backdrops */}
          <div className="absolute w-72 h-72 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl -z-10" />

          <IOSAppSimulator
            tasks={tasks}
            messages={messages}
            activeDevice={activeDevice}
            isOnline={isOnline}
            syncQueue={syncQueue}
            isLocked={isLocked}
            isBiometricsEnabled={isBiometricsEnabled}
            onUnlock={() => setIsLocked(false)}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onReorderTasks={handleReorderTasks}
            onSendMessage={handleSendMessage}
            notifications={notifications}
            onDismissNotification={handleDismissNotification}
            onTriggerNotification={triggerNotification}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        </div>

      </main>

      {/* Embedded print stylesheet dedicated for backup exporting formatting */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-serif leading-relaxed z-[9999]">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">iCloud SwiftUI Tasks Database Export</h1>
          <p className="text-xs mt-1">Generated: {new Date().toUTCString()} • Device Container: {activeDevice} • Status: {isOnline ? 'Online' : 'Offline'}</p>
        </div>

        <h3 className="text-lg font-bold mb-4">Replicated Task Objects:</h3>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="py-2">Task Title</th>
              <th className="py-2">Category</th>
              <th className="py-2">Priority</th>
              <th className="py-2">Due Date</th>
              <th className="py-2">Completed</th>
              <th className="py-2">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} className="border-b border-gray-200">
                <td className="py-2 font-semibold">{t.title}</td>
                <td className="py-2 capitalize">{t.category}</td>
                <td className="py-2">{t.priority}</td>
                <td className="py-2">{new Date(t.dueDate).toLocaleString()}</td>
                <td className="py-2">{t.isCompleted ? '✓ Yes' : 'No'}</td>
                <td className="py-2">{t.assignee || 'Unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 border-t border-black pt-4 text-[10px] text-gray-500">
          * End of Report. Simulated via CloudKit Private Sync services. Encrypted database.
        </div>
      </div>

    </div>
  );
}
