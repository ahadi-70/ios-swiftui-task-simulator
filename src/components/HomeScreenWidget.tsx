import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Task } from '../types';
import { CheckCircle2, Circle, AlertCircle, Calendar, Plus, RefreshCw, Layers } from 'lucide-react';
import { formatTime, formatDate } from '../utils';

interface HomeScreenWidgetProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  isDarkMode: boolean;
  onAddTaskClick: () => void;
}

export default function HomeScreenWidget({
  tasks,
  onCompleteTask,
  isDarkMode,
  onAddTaskClick
}: HomeScreenWidgetProps) {
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);
  const nextThree = pendingTasks.slice(0, 3);
  const nextFive = pendingTasks.slice(0, 5);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'text-rose-500 bg-rose-500/15 border-rose-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/15 border-amber-500/20';
      case 'Low': return 'text-emerald-500 bg-emerald-500/15 border-emerald-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-zinc-900/40 p-4 rounded-3xl border border-slate-250 dark:border-zinc-800" id="ios-widget-simulator">
      {/* Selector tab resembling Apple Developer Widget Configurator */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Layers className="text-blue-500" size={16} />
          <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 tracking-wide uppercase">
            iOS 17 Smart Widget
          </h3>
        </div>
        <div className="flex gap-1 bg-slate-200/60 dark:bg-zinc-800/80 p-0.5 rounded-lg text-[10px]">
          {(['small', 'medium', 'large'] as const).map(size => (
            <button
              key={size}
              onClick={() => setWidgetSize(size)}
              className={`px-2.5 py-1 rounded-md font-medium capitalize transition-all ${
                widgetSize === size
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-3 ml-1">
        Interactive Home Screen Widget. Tap circles within the widget below to toggle tasks.
      </p>

      {/* Actual Simulated Widget Box */}
      <div className="flex-1 flex items-center justify-center p-2">
        <motion.div
          layout
          className={`relative overflow-hidden transition-all duration-300 rounded-[28px] border outline outline-4 outline-offset-2 outline-slate-200/50 dark:outline-zinc-800/40 shadow-xl ${
            isDarkMode 
              ? 'bg-zinc-950/90 border-zinc-800 text-white' 
              : 'bg-white border-slate-100 text-slate-900 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.1)]'
          } ${
            widgetSize === 'small' ? 'w-36 h-36 p-3 flex flex-col justify-between' :
            widgetSize === 'medium' ? 'w-72 h-36 p-4 flex flex-col' :
            'w-72 h-72 p-5 flex flex-col justify-between'
          }`}
          style={{
            backgroundImage: isDarkMode
              ? 'radial-gradient(120% 120% at 0% 0%, rgba(39, 39, 42, 0.25) 0%, rgba(9, 9, 11, 0) 100%)'
              : 'radial-gradient(120% 120% at 0% 0%, rgba(219, 234, 254, 0.2) 0%, rgba(255, 255, 255, 0) 100%)'
          }}
        >
          {/* Internal Widget Container */}

          {/* 1. SMALL WIDGET (2x2) */}
          {widgetSize === 'small' && (
            <>
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-blue-500" />
                </div>
                <div className="text-right">
                  <span className="text-[20px] font-bold tracking-tight">
                    {pendingTasks.length}
                  </span>
                  <p className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 uppercase">
                    Due
                  </p>
                </div>
              </div>
              <div>
                {nextThree[0] ? (
                  <>
                    <h4 className="text-[11px] font-bold tracking-tight line-clamp-2 leading-tight">
                      {nextThree[0].title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 dark:text-zinc-500">
                      <Calendar size={10} />
                      <span>Today</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-[11px] font-bold tracking-tight text-emerald-500 dark:text-emerald-400">
                      All Caught Up!
                    </h4>
                    <p className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1">Enjoy your day.</p>
                  </>
                )}
              </div>
            </>
          )}

          {/* 2. MEDIUM WIDGET (4x2) */}
          {widgetSize === 'medium' && (
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-100 dark:border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
                    SwiftUI Task stack
                  </span>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md font-medium">
                  {completedTasks.length}/{tasks.length} Done
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-1.5 py-1">
                {nextThree.length > 0 ? (
                  nextThree.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between text-[11px] group cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-md p-1 transition-colors"
                      onClick={() => onCompleteTask(task.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button className="text-blue-500 shrink-0 hover:scale-110 active:scale-95 transition-all">
                          <Circle size={11} className="text-slate-400 dark:text-zinc-600 hover:text-blue-500" />
                        </button>
                        <span className="font-medium truncate text-slate-700 dark:text-zinc-300 leading-tight">
                          {task.title}
                        </span>
                      </div>
                      <span className={`text-[8px] font-bold uppercase px-1 rounded shrink-0 ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-emerald-500 font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 size={13} />
                      Zero deadlines pending!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. LARGE WIDGET (4x4) */}
          {widgetSize === 'large' && (
            <div className="flex flex-col h-full justify-between">
              {/* Header */}
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h4 className="text-[14px] font-bold tracking-tight">Today's Schedule</h4>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500">iCloud Synced</p>
                </div>
                <button 
                  onClick={onAddTaskClick}
                  className="w-7 h-7 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="my-2 p-2 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-medium mb-1">
                  <span>Sprint Completion</span>
                  <span>{tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Stack List */}
              <div className="flex-1 space-y-2 py-1 overflow-hidden">
                {nextFive.length > 0 ? (
                  nextFive.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between text-[11px] cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg p-1 px-1.5 transition-colors border border-slate-100/50 dark:border-zinc-900/50"
                      onClick={() => onCompleteTask(task.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Circle size={11} className="text-slate-400 dark:text-zinc-650 hover:text-blue-500 shrink-0" />
                        <span className="font-medium truncate text-slate-700 dark:text-zinc-300 leading-tight">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] text-slate-400 dark:text-zinc-500">
                          {formatTime(task.dueDate)}
                        </span>
                        <span className={`text-[8px] font-bold uppercase px-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority[0]}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-4">
                    <CheckCircle2 size={24} className="text-emerald-400 mb-1" />
                    <span className="text-[11px] font-medium text-emerald-400">All Completed!</span>
                  </div>
                )}
              </div>

              {/* Footer status link */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 text-[9px] flex justify-between text-slate-400 dark:text-zinc-500">
                <span className="font-mono">BUILD-OS-17.4</span>
                <span className="flex items-center gap-1">
                  <RefreshCw size={8} className="animate-spin duration-3000" />
                  Live Activity Active
                </span>
              </div>
            </div>
          )}

        </motion.div>
      </div>

      <div className="text-center mt-3">
        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
          *Hold / Tap components to interact with the simulated iOS extension.
        </span>
      </div>
    </div>
  );
}
