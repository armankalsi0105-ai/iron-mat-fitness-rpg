import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Sparkles, X, Terminal, Search, Loader2 } from 'lucide-react';
import FormattedCoachText from './ui/FormattedCoachText';

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseName, category }),
      });
      if (!response.ok) {
        throw new Error("Dojo Masters are offline. Could not contact standard servers.");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setTips(data.tips || "No tactical instructions found.");
    } catch (err: any) {
      setError(err.message || "Failed to establish combat intelligence link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Glowing borders */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />

            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider font-mono">
                    <Search size={10} /> Search Grounded INTEL
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-2 flex items-center gap-2">
                    <Terminal size={18} className="text-amber-500" /> Tactics Analyst
                  </h3>
                  <p className="text-sm font-semibold text-zinc-400 mt-1 uppercase tracking-wider">
                    Target: <span className="text-amber-400 font-bold">{exerciseName}</span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Box Content */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 min-h-[160px] flex flex-col justify-center">
                {loading && (
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">Gleaning form tips...</p>
                      <p className="text-[10px] text-zinc-500 font-mono">Querying live Search Grounding Index</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center space-y-3">
                    <ShieldAlert size={32} className="text-rose-500 mx-auto" />
                    <p className="text-sm text-rose-400 font-semibold">{error}</p>
                    <button
                      onClick={fetchTips}
                      className="px-4 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-black uppercase hover:bg-rose-500/20 transition-all"
                    >
                      Retry Connection
                    </button>
                  </div>
                )}

                {!loading && !error && tips && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <FormattedCoachText text={tips} variant="tactical" />
                    <div className="pt-3 border-t border-zinc-800/60 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                      <span>Source: Live Search Index</span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Sparkles size={10} /> Dojo Master Analyzed
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase"
                >
                  Dismiss Intel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
