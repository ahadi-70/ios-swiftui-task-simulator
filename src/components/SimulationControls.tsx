import React from 'react';
import { 
  Laptop, Smartphone, Tablet, Wifi, WifiOff, Bell, Calendar, 
  Database, RefreshCw, FileSpreadsheet, Lock, ShieldCheck, 
  HelpCircle, Sparkles, MessageSquare, Plus, Info 
} from 'lucide-react';
import { Task, SyncLog } from '../types';
import { exportToCSV } from '../utils';

interface SimulationControlsProps {
  activeDevice: string;
  setActiveDevice: (device: string) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  syncQueueLength: number;
  syncLogs: SyncLog[];
  clearLogs: () => void;
  onTriggerNotification: (title: string, body: string, type: 'alert' | 'reminder' | 'sync' | 'team') => void;
  onPreloadSampleTasks: () => void;
  tasks: Task[];
  isBiometricsEnabled: boolean;
  setIsBiometricsEnabled: (enabled: boolean) => void;
  onLockDevice: () => void;
}

export default function SimulationControls({
  activeDevice,
  setActiveDevice,
  isOnline,
  setIsOnline,
  syncQueueLength,
  syncLogs,
  clearLogs,
  onTriggerNotification,
  onPreloadSampleTasks,
  tasks,
  isBiometricsEnabled,
  setIsBiometricsEnabled,
  onLockDevice
}: SimulationControlsProps) {

  const triggerDeadlineAlert = () => {
    // Find highest priority task pending
    const highTask = tasks.find(t => !t.isCompleted && t.priority === 'High');
    if (highTask) {
      onTriggerNotification(
        "🚨 High Priority Deadline Warning",
        `Upcoming: "${highTask.title}" is due shortly! Swift action recommended.`,
        "alert"
      );
    } else {
      onTriggerNotification(
        "🚨 Upcoming Deadline Alert",
        "Upcoming: 'Verify Apple Push Notification Token' is due in 3 hours.",
        "alert"
      );
    }
  };

  const triggerDailyReminder = () => {
    onTriggerNotification(
      "🌅 Daily Task Summary",
      `Good morning! You have ${tasks.filter(t => !t.isCompleted).length} tasks pending on iCloud for today. Set up focus blocks now!`,
      "reminder"
    );
  };

  const handleCsvExport = () => {
    exportToCSV(tasks);
    onTriggerNotification(
      "CSV Export Complete",
      `Successfully exported ${tasks.length} tasks to CSV file.`,
      "sync"
    );
  };

  const handlePrintPdf = () => {
    window.print();
    onTriggerNotification(
      "PDF Layout Loaded",
      "System print stylesheet aligned task layout for standard PDF generation.",
      "sync"
    );
  };

  return (
    <div className="w-full bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-6 text-white font-sans" id="simulator-control-panel">
      
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#0A84FF] rounded-full animate-ping" />
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/90 flex items-center gap-1.5 font-display">
            <Sparkles size={14} className="text-[#FFD60A] animate-spin duration-5000" />
            Simulator Console Panel
          </h2>
        </div>
        <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
          Replicate real-world iCloud signals, push alerts, and physical hardware layouts.
        </p>
      </div>

      {/* 1. Multi-Device Setup */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8E8E93] tracking-wider block">
          💻 Active iCloud Hardware
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'iphone', name: 'iPhone 15 Pro', icon: Smartphone },
            { id: 'ipad', name: 'iPad Pro M4', icon: Tablet },
            { id: 'macbook', name: 'MacBook Air M3', icon: Laptop }
          ].map(device => {
            const Icon = device.icon;
            const isSelected = activeDevice === device.id;
            return (
              <button
                key={device.id}
                onClick={() => setActiveDevice(device.id)}
                className={`py-3 px-2 text-center rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 group cursor-pointer ${
                  isSelected 
                    ? 'bg-[#0A84FF] text-white border-transparent shadow-[0_4px_12px_rgba(10,132,255,0.3)] scale-[102%]' 
                    : 'bg-[#2C2C2E] text-white/60 border-white/5 hover:text-white hover:bg-[#3A3A3C]'
                }`}
              >
                <Icon size={18} className={isSelected ? 'animate-bounce' : 'group-hover:scale-110 transition-transform text-[#8E8E93] group-hover:text-white'} />
                <span className="text-[9px] font-bold tracking-tight truncate w-full">{device.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sync Offline/Online simulation */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8E8E93] block">
          ☁️ CloudKit Connectivity Status
        </span>
        <div className="bg-[#2C2C2E] p-4 rounded-2xl border border-white/5 flex justify-between items-center transition-all">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isOnline ? 'bg-[#30D158]/10 text-[#30D158]' : 'bg-[#FF453A]/10 text-[#FF453A]'}`}>
              {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
            </div>
            <div>
              <span className="text-xs font-bold block text-white/90">
                {isOnline ? 'Fully Operational' : 'Offline Mode Active'}
              </span>
              <span className="text-[10px] text-[#8E8E93] block mt-0.5 tracking-tight font-mono">
                {isOnline ? 'Broadcasting live iCloud signals' : `${syncQueueLength} transactions queued locally`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
              isOnline 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-[#0A84FF] text-white hover:bg-[#0A84FF]/80 shadow-md animate-pulse'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Reconnect iCloud'}
          </button>
        </div>
      </div>

      {/* 3. Push Notifications Manual Triggers */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={triggerDeadlineAlert}
          className="p-3 bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-white/80 hover:text-white cursor-pointer transition-all active:scale-95 text-xs font-bold shadow-sm"
        >
          <Bell size={14} className="text-[#FF453A]" />
          <span>Deadline Alert</span>
        </button>

        <button
          onClick={triggerDailyReminder}
          className="p-3 bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-white/80 hover:text-white cursor-pointer transition-all active:scale-95 text-xs font-bold shadow-sm"
        >
          <Calendar size={14} className="text-[#FF9F0A]" />
          <span>Daily Summary</span>
        </button>
      </div>

      {/* 4. Security & Biometrics Controls */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8E8E93] block">
          🔒 Secure User Authentication
        </span>
        <div className="bg-[#2C2C2E] p-3.5 rounded-2xl border border-white/5 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-[#BF5AF2]" />
            <span className="font-semibold text-white/90">FaceID Security Integration</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isBiometricsEnabled} 
              onChange={() => setIsBiometricsEnabled(!isBiometricsEnabled)} 
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#30D158]" />
          </label>
        </div>
        <button
          onClick={onLockDevice}
          className="w-full py-2 bg-[#FF453A]/10 hover:bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/20 text-[10px] font-bold rounded-xl cursor-pointer tracking-wider uppercase transition-all"
        >
          🔐 Immediately Lock Screen (Biometric Demonstration)
        </button>
      </div>

      {/* 5. Backups & Data Export */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8E8E93] block">
          📦 Backups & Core Exports
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCsvExport}
            className="p-3 bg-[#2C2C2E] border border-white/5 hover:bg-[#3A3A3C] rounded-2xl flex items-center justify-center gap-2 text-white/90 cursor-pointer transition-all active:scale-95 text-[10px] font-bold shadow-sm"
          >
            <FileSpreadsheet size={13} className="text-[#30D158]" />
            <span>Export to CSV</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="p-3 bg-[#2C2C2E] border border-white/5 hover:bg-[#3A3A3C] rounded-2xl flex items-center justify-center gap-2 text-white/90 cursor-pointer transition-all active:scale-95 text-[10px] font-bold shadow-sm"
          >
            <Database size={13} className="text-[#BF5AF2]" />
            <span>Export as PDF</span>
          </button>
        </div>
      </div>

      {/* 6. Live Synchronous Database Logs */}
      <div className="flex-1 flex flex-col min-h-[170px] bg-black/60 text-zinc-300 font-mono text-[9px] rounded-2xl p-4 border border-white/5 select-none relative">
        <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] animate-pulse" />
            <span className="text-[9px] font-bold tracking-tight text-white/80 uppercase">CloudKit Server Sync Log</span>
          </div>
          <button 
            onClick={clearLogs}
            className="text-[8px] hover:underline text-[#FF453A] cursor-pointer uppercase"
          >
            Clear logs
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
          {syncLogs.length > 0 ? (
            syncLogs.map(log => (
              <div key={log.id} className="flex justify-between items-baseline gap-1.5">
                <span className="text-white/40 text-[8px] shrink-0 font-mono">{log.timestamp}</span>
                <span className="text-[#0A84FF] shrink-0 font-bold capitalize">[{log.device}]</span>
                <span className="text-zinc-200 flex-1 truncate font-mono">{log.action}</span>
                <span className={`shrink-0 text-[8px] font-bold uppercase font-mono ${
                  log.status === 'success' ? 'text-[#30D158]' :
                  log.status === 'offline' ? 'text-[#FF9F0A] animate-pulse' : 'text-zinc-500'
                }`}>
                  -{log.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-[#8E8E93]/60 italic font-mono">
              *Listening for database replication events...
            </div>
          )}
        </div>
        <div className="absolute bottom-1 right-2 text-[7px] text-[#8E8E93]/50 tracking-wider uppercase font-mono">
          CloudKit v17.4
        </div>
      </div>

      {/* Sample presets preload */}
      <button
        onClick={onPreloadSampleTasks}
        className="w-full text-center py-3 bg-[#0A84FF]/10 border border-[#0A84FF]/20 hover:bg-[#0A84FF]/20 text-white text-[10px] font-bold rounded-2xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <RefreshCw size={12} className="text-[#0A84FF] animate-spin duration-3000" />
        <span>Preload Multi-device Shared Demo Data</span>
      </button>

    </div>
  );
}
