import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Scan, Key, Lock, Unlock, Eye, HelpCircle } from 'lucide-react';
import { playSound } from '../utils';

interface LockScreenProps {
  onUnlock: () => void;
  isDarkMode: boolean;
}

export default function LockScreen({ onUnlock, isDarkMode }: LockScreenProps) {
  const [passcode, setPasscode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorStyle, setErrorStyle] = useState<boolean>(false);
  const correctPasscode = '1717'; // Set a default classic passcode

  useEffect(() => {
    // Proactively scan FaceID on mount
    triggerFaceID();
  }, []);

  const triggerFaceID = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult('idle');
    playSound('click');
    setTimeout(() => {
      // 85% success, 15% manual bypass needed
      const success = Math.random() > 0.15;
      if (success) {
        setScanResult('success');
        playSound('lock');
        setTimeout(() => {
          setIsScanning(false);
          onUnlock();
        }, 800);
      } else {
        setScanResult('failed');
        playSound('notify');
        setErrorStyle(true);
        setTimeout(() => {
          setIsScanning(false);
          setErrorStyle(false);
        }, 1200);
      }
    }, 1500);
  };

  const handleKeyPress = (num: string) => {
    if (passcode.length >= 4) return;
    playSound('click');
    const nextPasscode = passcode + num;
    setPasscode(nextPasscode);

    if (nextPasscode === correctPasscode) {
      playSound('lock');
      setTimeout(() => {
        onUnlock();
      }, 300);
    } else if (nextPasscode.length === 4) {
      // Failed passcode
      playSound('notify');
      setTimeout(() => {
        setErrorStyle(true);
        setPasscode('');
        setTimeout(() => setErrorStyle(false), 600);
      }, 200);
    }
  };

  const handleDelete = () => {
    playSound('click');
    setPasscode(prev => prev.slice(0, -1));
  };

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className={`w-full h-full flex flex-col justify-between p-6 select-none relative overflow-hidden transition-colors duration-500 rounded-[48px] ${
      isDarkMode ? 'bg-zinc-950 text-white' : 'bg-slate-900 text-white'
    }`}
    style={{
      backgroundImage: isDarkMode 
        ? 'radial-gradient(circle at top right, rgba(30, 27, 75, 0.6) 0%, rgba(9, 9, 11, 1) 100%)'
        : 'radial-gradient(circle at top right, rgba(14, 116, 144, 0.4) 0%, rgba(15, 23, 42, 1) 100%)'
    }}
    id="ios-lock-screen"
    >
      {/* Top Status Indicators */}
      <div className="flex justify-between items-center px-4 pt-4 mt-2">
        <span className="text-xs font-semibold text-white/80">{timeStr}</span>
        <div className="flex items-center gap-1.5 text-white/80 text-xs">
          <Shield size={12} className="text-emerald-400" />
          <span>Biometric Protection</span>
        </div>
      </div>

      {/* Hero Time/Date Section */}
      <div className="flex flex-col items-center mt-6 text-center">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-white/80 text-sm font-medium tracking-wide uppercase"
        >
          {dateStr}
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl font-thin tracking-tighter mt-1 text-white"
        >
          {timeStr}
        </motion.div>
        
        <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-white/10 rounded-full text-xs text-white/90 backdrop-blur-md">
          <Lock size={11} className="animate-pulse" />
          <span>Database Encrypted</span>
        </div>
      </div>

      {/* Center Biometric Visualizer */}
      <div className="flex flex-col items-center justify-center my-6">
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Outward Ring Pulsing */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 border border-blue-400 rounded-full"
                />
                
                {/* Secondary Inward scanning sweep */}
                <div className="absolute inset-2 border-2 border-dashed border-blue-500/30 rounded-full animate-spin duration-3000" />
                
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner">
                  <Scan size={32} className="text-blue-400 animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-blue-300 mt-3 animate-pulse font-medium tracking-wide">
                Verifying FaceID...
              </p>
            </motion.div>
          ) : scanResult === 'success' ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Unlock size={28} className="text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-400 mt-3 font-semibold tracking-wide">
                FaceID Unlocked
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <button
                onClick={triggerFaceID}
                className="w-16 h-16 bg-white/10 hover:bg-white/15 active:scale-95 transition-all rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md"
              >
                <Scan size={26} className="text-white/80" />
              </button>
              <p className="text-xs text-white/60 mt-3 hover:text-white/90 cursor-pointer transition-colors" onClick={triggerFaceID}>
                Tap to Scan FaceID
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Numeric Passcode Form */}
      <div className="flex flex-col items-center space-y-6">
        {/* Passcode dots display */}
        <motion.div 
          animate={errorStyle ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center space-x-4 mb-2"
        >
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                errorStyle 
                  ? 'bg-rose-500 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                  : index < passcode.length
                    ? 'bg-white border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.6)]' 
                    : 'border-white/50 bg-transparent'
              }`}
            />
          ))}
        </motion.div>

        {/* Tactile iOS Keys */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 mx-auto max-w-[270px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-2xl font-light transition-all flex items-center justify-center backdrop-blur-md cursor-pointer border border-white/5 shadow-sm"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center text-[11px] font-medium text-white/50">
            PIN: 1717
          </div>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-2xl font-light transition-all flex items-center justify-center backdrop-blur-md cursor-pointer border border-white/5 shadow-sm"
          >
            0
          </button>
          <div className="flex items-center justify-center">
            {passcode.length > 0 ? (
              <button
                onClick={handleDelete}
                className="text-xs font-semibold hover:text-white/90 text-white/60 lowercase transition-all active:scale-95"
              >
                Delete
              </button>
            ) : (
              <button
                onClick={triggerFaceID}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 dropdown-toggle transition-all active:scale-95 flex items-center gap-1"
              >
                FaceID
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Slide to Unlock handle */}
      <div className="flex flex-col items-center justify-center mt-3 pb-2 select-none">
        <div className="w-36 h-1 bg-white/30 rounded-full mb-1" />
        <span className="text-[10px] text-white/40 tracking-wider">Device Securely Sandbox-Locked</span>
      </div>
    </div>
  );
}
