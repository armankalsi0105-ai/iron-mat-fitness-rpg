import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Shield, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGeminiApiKey, setGeminiApiKey } from '../config/env';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getGeminiApiKey();
      if (stored) setApiKey(stored);
      else setApiKey("");
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    setGeminiApiKey(apiKey || null);
    setApiKey(getGeminiApiKey());
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-ntc-elevated border border-ntc-border rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-ntc-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-ntc p-2 rounded-xl text-zinc-400">
                    <Settings size={20} />
                  </div>
                  <h2 className="text-white font-bold text-lg">Settings</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white p-2"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Key size={18} className="text-volt-500 mt-1" />
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">API key</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Save your Gemini API key to unlock AI Coach and Avatar features.
                      </p>
                    </div>
                  </div>

                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="e.g., AIza..."
                    className="w-full bg-ntc border border-ntc-border rounded-xl px-4 py-3 text-sm text-white focus:border-volt-500/50 focus:ring-1 focus:ring-volt-500/50 outline-none"
                  />
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-ntc p-3 rounded-xl">
                    <Shield size={12} className="text-zinc-600 shrink-0" />
                    <p>Keys are stored locally in your browser.</p>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
                >
                  {saved ? (
                    <>
                      <CheckCircle size={18} />
                      Saved
                    </>
                  ) : "Save key"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
