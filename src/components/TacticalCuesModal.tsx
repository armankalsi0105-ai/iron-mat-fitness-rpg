import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Sparkles, X, Search, Loader2 } from 'lucide-react';
import { geminiRequestHeaders } from '../config/env';

interface TacticalCuesModalProps {
  exerciseName: string;
  category: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TacticalCuesModal({ exerciseName, category, isOpen, onClose }: TacticalCuesModalProps) {
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && exerciseName) {
      fetchTips();
    }
  }, [isOpen, exerciseName]);

  const fetchTips = async () => {
    setLoading(true);
    setError("");
    setTips("");
    try {
      const response = await fetch("/api/ai/tips", {
        method: "POST",
        headers: geminiRequestHeaders(),
        body: JSON.stringify({ exerciseName, category }),
      });
      if (!response.ok) {
        throw new Error("Could not load form tips. Please try again.");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setTips(data.tips || "No tips found for this exercise.");
    } catch (err: any) {
      setError(err.message || "Failed to load tips.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-lg bg-ntc-elevated border border-ntc-border rounded-2xl overflow-hidden relative"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ntc text-volt-500 text-xs font-semibold">
                    <Search size={12} /> Form tips
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-3">
                    {exerciseName}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {category}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-ntc text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-ntc border border-ntc-border rounded-xl p-5 min-h-[160px] flex flex-col justify-center">
                {loading && (
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 text-volt-500 animate-spin mx-auto" />
                    <p className="text-sm text-zinc-400">Loading form cues...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center space-y-3">
                    <ShieldAlert size={32} className="text-rose-500 mx-auto" />
                    <p className="text-sm text-rose-400 font-medium">{error}</p>
                    <button
                      onClick={fetchTips}
                      className="px-4 py-2 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition-all"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!loading && !error && tips && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-sm leading-relaxed text-zinc-200 whitespace-pre-line text-left">
                      {tips}
                    </div>
                    <div className="pt-3 border-t border-ntc-border flex justify-between items-center text-xs text-zinc-500">
                      <span>AI-powered tips</span>
                      <span className="flex items-center gap-1 text-volt-500">
                        <Sparkles size={10} /> Verified
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-ntc border border-ntc-border rounded-full text-sm font-semibold text-zinc-400 hover:text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
