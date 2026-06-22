import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Paintbrush,
  X,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react';
import Button from './ui/Button';
import { AVATAR_ACCEPT, AvatarUploadError, processAvatarUpload } from '../lib/avatarUpload';

interface AvatarCreatorProps {
  currentAvatarUrl: string;
  onAvatarGenerated: (newUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

type AvatarMode = 'upload' | 'generate';

const CREATIVE_PROMPTS = [
  'A powerful wrestler with golden headgear, neon-lit gym background, anime style portrait',
  'A high school athlete in team singlet, intense focus, cinematic lighting, square portrait',
  'A rugged martial arts champion with tactical grip tape, dark dojo background',
  'A cyber-athlete with amber visor and training gear, hyper-detailed render',
  'A master competitor shrouded in shadow, glowing amber eyes, championship energy',
];

export default function AvatarCreator({
  currentAvatarUrl,
  onAvatarGenerated,
  isOpen,
  onClose,
}: AvatarCreatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<AvatarMode>('upload');
  const [prompt, setPrompt] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState(0);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const hasEditableImage = Boolean(
    (uploadPreview || currentAvatarUrl)?.startsWith('data:')
  );
  const busy = generating || uploading;

  const resetUploadPreview = () => setUploadPreview(null);

  const handleModeChange = (next: AvatarMode) => {
    setMode(next);
    setError('');
    if (next === 'generate') resetUploadPreview();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const dataUrl = await processAvatarUpload(file);
      setUploadPreview(dataUrl);
    } catch (err) {
      if (err instanceof AvatarUploadError) {
        setError(err.message);
      } else {
        setError('Could not load that image. Try another file.');
      }
      resetUploadPreview();
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUpload = () => {
    if (!uploadPreview) {
      setError('Choose a photo first.');
      return;
    }
    onAvatarGenerated(uploadPreview);
    resetUploadPreview();
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Add a prompt describing your avatar, or switch to Upload.');
      return;
    }
    setGenerating(true);
    setError('');

    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 1800);

    try {
      let currentImageBase64: string | null = null;
      let shouldEdit = isEditMode;
      const sourceImage = uploadPreview || currentAvatarUrl;

      if (isEditMode) {
        if (sourceImage?.startsWith('data:')) {
          currentImageBase64 = sourceImage;
        } else {
          shouldEdit = false;
        }
      }

      const response = await fetch('/api/ai/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          currentImage: currentImageBase64,
          isEdit: shouldEdit,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Avatar generation failed (${response.status}). Check your Gemini API key in .env.local.`
        );
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.imageUrl) {
        throw new Error('No image returned from Gemini. Try again in a moment.');
      }

      onAvatarGenerated(data.imageUrl);
      resetUploadPreview();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate avatar.');
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  const previewUrl = uploadPreview || currentAvatarUrl;

  const getLoadingMessage = () => {
    const list = [
      'SYNTHESIZING COMBATANT DNA MATRIX...',
      'STABILIZING NEON FORCEFIELDS & PIXELS...',
      'INFUSING FIGHTING SPIRIT INTO METRICS...',
      'POLISHING MASTERWORK SHADERS & MAT FIXTURES...',
    ];
    return list[stage];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-creator-title"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-rose-500" />

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-amber-500 uppercase flex items-center gap-1">
                    <Sparkles size={11} className="fill-amber-500" /> Avatar Studio
                  </p>
                  <h3
                    id="avatar-creator-title"
                    className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1"
                  >
                    <Wand2 size={20} className="text-amber-500" /> Your Athlete Look
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close avatar studio"
                >
                  <X size={16} />
                </button>
              </div>

              <div
                className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-xl border border-white/[0.06]"
                role="tablist"
                aria-label="Avatar method"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'upload'}
                  onClick={() => handleModeChange('upload')}
                  className={`py-3 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${
                    mode === 'upload'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Upload size={14} /> Upload
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'generate'}
                  onClick={() => handleModeChange('generate')}
                  className={`py-3 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${
                    mode === 'generate'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Sparkles size={14} /> AI Generate
                </button>
              </div>

              <div className="flex gap-4 items-center">
                <div className="relative shrink-0">
                  <img
                    src={previewUrl}
                    alt="Current athlete avatar"
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-zinc-700/80 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded-md text-[8px] font-bold text-zinc-400 uppercase font-mono">
                    {uploadPreview ? 'NEW' : 'ACTIVE'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    {mode === 'upload' ? 'Your photo' : 'AI synthesis'}
                  </p>
                  <p className="text-[12px] text-zinc-500 mt-1 leading-relaxed">
                    {mode === 'upload'
                      ? 'JPG, PNG, or WebP · max 5 MB · auto-resized for your profile'
                      : 'Describe your look or edit an uploaded photo with AI'}
                  </p>
                </div>
              </div>

              {mode === 'upload' ? (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={AVATAR_ACCEPT}
                    className="sr-only"
                    onChange={handleFileSelect}
                    aria-label="Upload athlete photo"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                    className="w-full min-h-[120px] rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:border-amber-500/40 hover:bg-zinc-900 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                          Processing photo...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-amber-500" />
                        <span className="text-sm font-bold text-white">Choose photo</span>
                        <span className="text-[11px] text-zinc-500">Tap to browse your library</span>
                      </>
                    )}
                  </button>

                  {uploadPreview && (
                    <p className="text-[11px] text-emerald-400 font-semibold text-center">
                      Photo ready — tap Use Photo to save
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                      Synthesis method
                    </label>
                    <div className="flex gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 border min-h-[44px] cursor-pointer ${
                          !isEditMode
                            ? 'bg-amber-500 text-black border-transparent shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon size={14} /> Fresh Forge
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditMode(true)}
                        disabled={!hasEditableImage}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 border min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          isEditMode
                            ? 'bg-amber-400 text-black border-transparent shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title={
                          hasEditableImage
                            ? 'Adjust your uploaded or AI avatar'
                            : 'Upload a photo or generate an avatar first'
                        }
                      >
                        <Paintbrush size={14} /> Edit Active
                      </button>
                    </div>
                    {!hasEditableImage && isEditMode && (
                      <p className="text-[9px] text-amber-500 font-semibold mt-1">
                        Upload a photo or forge a fresh avatar to unlock Edit Active.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                      <span>Visual prompt</span>
                      <span className="text-[10px] text-zinc-500 font-mono italic">Gemini</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your athlete avatar (e.g. wrestler in gold singlet, fierce expression, studio portrait)..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none font-sans"
                      disabled={busy}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      Quick prompts
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {CREATIVE_PROMPTS.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPrompt(p)}
                          className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg hover:border-amber-500/40 hover:text-white transition-all text-left truncate max-w-[280px] min-h-[36px]"
                          disabled={busy}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                {generating ? (
                  <div className="space-y-3 bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                      <p className="text-xs font-black text-white font-mono tracking-wider">
                        {getLoadingMessage()}
                      </p>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        style={{ width: '40%' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="md" onClick={onClose} disabled={busy}>
                      Cancel
                    </Button>
                    {mode === 'upload' ? (
                      <Button
                        fullWidth
                        size="md"
                        icon={<Upload size={16} />}
                        onClick={handleConfirmUpload}
                        disabled={!uploadPreview || uploading}
                      >
                        Use Photo
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        size="md"
                        icon={<RefreshCw size={16} />}
                        onClick={handleGenerate}
                        disabled={busy}
                      >
                        {isEditMode ? 'Modify with AI' : 'Generate Avatar'}
                      </Button>
                    )}
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
