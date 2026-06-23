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
      text: "Hi! I'm your IronPath coach. Ask me about training form, recovery, nutrition, or how to structure your workouts. I'm here to help you train smarter."
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
          setHistory(prev => [...prev, { role: 'assistant', text: data.error || "Connection timed out. Please try again." }]);
        }
      }
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'assistant', text: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHistory([{
      role: 'assistant',
      text: "Chat cleared. What would you like to work on?"
    }]);
    setErrorConfig({ visible: false, message: "", isAuthCode: false });
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] max-h-[800px] border border-ntc-border bg-ntc-elevated rounded-2xl overflow-hidden mt-4 relative">
      <div className="p-4 border-b border-ntc-border flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-ntc p-2 rounded-xl text-volt-500">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold leading-none text-lg tracking-tight">Coach</h2>
            <p className="text-xs text-zinc-500 mt-1">AI training assistant</p>
          </div>
        </div>
        <button 
          onClick={handleClear}
          className="text-zinc-500 hover:text-white p-2 rounded-full cursor-pointer transition-colors"
          title="Reset conversation"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 relative z-10">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                {msg.role === 'user' ? (
                  <>
                    <span>You</span>
                    <User size={12} />
                  </>
                ) : (
                  <>
                    <Bot size={12} className="text-volt-500" />
                    <span className="text-volt-500">Coach</span>
                  </>
                )}
              </div>
              <div 
                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-white text-black font-medium rounded-br-md' 
                    : 'bg-ntc border border-ntc-border text-zinc-300 rounded-bl-md prose prose-invert prose-p:leading-snug prose-sm max-w-none'
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
             <div className="bg-ntc border border-ntc-border p-4 rounded-2xl rounded-bl-md flex items-center gap-2 text-zinc-500 text-sm mt-2">
               <Bot size={16} className="text-volt-500" /> Thinking...
             </div>
           </div>
        )}

        {errorConfig.visible && errorConfig.isAuthCode && (
          <div className="my-4 mx-2 p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="bg-rose-500/20 p-2.5 rounded-xl shrink-0 mt-1 text-rose-500">
                <ShieldAlert size={22} />
              </div>
              <div className="flex-1 text-sm text-zinc-300 space-y-3 leading-relaxed">
                <p><span className="text-rose-400 font-semibold block mb-1">Coach offline</span>{errorConfig.message}</p>
                
                <div className="bg-ntc border border-ntc-border p-4 rounded-xl mt-3 space-y-2 text-xs text-zinc-400 leading-relaxed">
                  <p className="text-rose-400 font-semibold text-xs mb-2 border-b border-ntc-border pb-2">Setup required</p>
                  <p>Add your API key in Settings (sliders icon in the header).</p>
                  <p>Or set in your <code>.env</code> file:</p>
                  <code className="block bg-ntc-elevated p-2 rounded border border-ntc-border text-volt-500 mt-2 min-w-full overflow-x-auto whitespace-pre">
                    GEMINI_API_KEY=AI...your_key_here
                  </code>
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

      <div className="p-4 border-t border-ntc-border z-10 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-end gap-2 bg-ntc border border-ntc-border rounded-2xl p-2 focus-within:border-volt-500/50 transition-all"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about training, recovery, or nutrition..."
            className="flex-1 bg-transparent border-none focus:outline-none resize-none pt-2.5 pb-2 px-3 text-sm text-white placeholder-zinc-500 min-h-[44px] max-h-[120px] disabled:opacity-50"
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
            className={`p-3 rounded-xl mb-1 shrink-0 transition-all ${
              input.trim() && !loading
                ? 'bg-volt-500 text-black hover:bg-volt-400 cursor-pointer' 
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
