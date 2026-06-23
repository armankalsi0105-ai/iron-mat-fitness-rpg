import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCcw, ShieldAlert, X } from 'lucide-react';
import { AthleteProfile } from '../types';
import Markdown from 'react-markdown';
import { geminiRequestHeaders } from '../config/env';

interface AICoachProps {
  activeProfile: AthleteProfile;
}

export default function AICoach({ activeProfile }: AICoachProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorConfig, setErrorConfig] = useState<{ visible: boolean; message: string; isAuthCode: boolean }>({ visible: false, message: "", isAuthCode: false });
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: "Yo champion! I'm your IronPath AI Coach. Ask me how to blast doublelegs, pack explosive hip drive, optimize grip endurance safely, or lay down recovery meals. Remember: no ego-lifting in my room, protect your neck and joints!"
    }
  ]);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading, errorConfig]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    setHistory(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    setErrorConfig({ visible: false, message: "", isAuthCode: false });

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: geminiRequestHeaders(),
        body: JSON.stringify({
          message: msg,
          history: history,
          athleteProfile: activeProfile
        })
      });

      const data = await response.json();
      
      if (response.status === 200 && data.response) {
        setHistory(prev => [...prev, { role: 'assistant', text: data.response }]);
      } else {
        if (response.status === 503 || data.code === "MISSING_API_KEY") {
           setErrorConfig({ 
             visible: true, 
             message: data.error || "AI Coach is not configured correctly. Missing API Key.",
             isAuthCode: true
           });
        } else {
          setHistory(prev => [...prev, { role: 'assistant', text: data.error || "Coaching connection timed out. Let's ask again, soldier!" }]);
        }
      }
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'assistant', text: "Connection error. Give me that query once more!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHistory([{
      role: 'assistant',
      text: "Chat cleared. What's the new objective?"
    }]);
    setErrorConfig({ visible: false, message: "", isAuthCode: false });
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] max-h-[800px] border border-zinc-900 bg-zinc-950 rounded-3xl overflow-hidden shadow-xl mt-4 relative">
      <div className="p-4 border-b border-zinc-900 bg-black/40 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
            <Bot size={20} className="fill-current animate-pulse" />
          </div>
          <div>
            <h2 className="text-white font-black font-sans italic uppercase leading-none text-lg tracking-tight">IRONPATH COACH</h2>
            <p className="text-[10px] text-amber-500/80 font-mono tracking-widest font-bold uppercase mt-1">AI Athletic Analyst</p>
          </div>
        </div>
        <button 
          onClick={handleClear}
          className="text-zinc-500 hover:text-white p-2 rounded-full cursor-pointer transition-colors"
          title="Reset Conversation"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
                {msg.role === 'user' ? (
                  <>
                    <span>YOU</span>
                    <User size={12} />
                  </>
                ) : (
                  <>
                    <Bot size={12} className="text-amber-500" />
                    <span className="text-amber-500">SYSTEM</span>
                  </>
                )}
              </div>
              <div 
                className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-amber-500 text-black font-medium border-none shadow-[0_4px_14px_0_rgba(245,158,11,0.2)] rounded-tr-sm' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-inner rounded-tl-sm prose prose-invert prose-p:leading-snug prose-sm max-w-none font-mono tracking-tight'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="markdown-body">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl rounded-tl-sm flex items-center gap-2 text-zinc-500 text-sm font-mono mt-4 shadow-inner">
               <Bot size={16} className="animate-bounce text-amber-500" /> Processing tactical vectors...
             </div>
           </div>
        )}

        {/* Floating Setup Warning for Missing Config */}
        {errorConfig.visible && errorConfig.isAuthCode && (
          <div className="my-4 mx-2 p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl animate-in fade-in slide-in-from-bottom-2 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-rose-500/20 p-2.5 rounded-xl shrink-0 mt-1 font-black text-rose-500">
                <ShieldAlert size={24} />
              </div>
              <div className="flex-1 text-sm text-zinc-300 font-mono space-y-3 leading-relaxed">
                <p><span className="text-rose-400 font-bold uppercase tracking-wider block mb-1">Coach Connectivity Offline</span>{errorConfig.message}</p>
                
                <div className="bg-black border border-rose-500/20 p-4 rounded-xl mt-3 space-y-2 text-xs text-zinc-400 font-mono shadow-inner leading-relaxed">
                  <p className="text-rose-500 font-bold uppercase tracking-widest text-[10px] mb-2 border-b border-rose-500/20 pb-1">Activation required</p>
                  <p>You can set your API Key in the application Settings menu (click the <strong>Sliders icon</strong> in the top header).</p>
                  <p>Or alternatively over the <code>.env</code> file:</p>
                  <code className="block bg-zinc-900 p-2 rounded border border-zinc-800 text-amber-400 mt-2 min-w-full overflow-x-auto whitespace-pre">
                    GEMINI_API_KEY=AI...your_key_here
                  </code>
                  <p className="mt-2 text-xs italic opacity-80 pt-2 border-t border-zinc-900">Get a key automatically from Google AI Studio settings.</p>
                </div>
              </div>
              <button 
                onClick={() => setErrorConfig({ visible: false, message: "", isAuthCode: false })}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} className="h-4" />
      </div>

      <div className="p-4 border-t border-zinc-900 bg-black/40 z-10 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all shadow-inner"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about training, recovery, or diet..."
            className="flex-1 bg-transparent border-none focus:outline-none resize-none pt-2.5 pb-2 px-3 text-sm text-white placeholder-zinc-500 font-sans tracking-wide min-h-[44px] max-h-[120px] disabled:opacity-50"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`p-3 rounded-xl mb-1 shrink-0 transition-all  ${
              input.trim() && !loading
                ? 'bg-amber-500 text-black shadow-[0_2px_10px_0_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:scale-95 cursor-pointer' 
                : 'bg-zinc-800 text-zinc-600'
            }`}
          >
            <Send size={18} className={input.trim() && !loading ? "fill-current" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
