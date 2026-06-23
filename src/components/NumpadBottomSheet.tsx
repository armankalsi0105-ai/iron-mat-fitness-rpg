import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Delete } from 'lucide-react';

interface NumpadBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onValueChange: (val: string) => void;
  title: string;
  onSave: () => void;
}

export default function NumpadBottomSheet({
  isOpen,
  onClose,
  value,
  onValueChange,
  title,
  onSave
}: NumpadBottomSheetProps) {
  const handleKey = (key: string) => {
    if (key === 'CE') {
      onValueChange('');
    } else if (key === 'DEL') {
      onValueChange(value.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) onValueChange(value + '.');
    } else {
      if (value.length < 5) onValueChange(value + key);
    }
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
            className="fixed inset-0 bg-black/80 z-50 pointer-events-auto"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-ntc-elevated border-t border-ntc-border rounded-t-2xl pb-safe flex flex-col pointer-events-auto"
            style={{ maxHeight: '80dvh' }}
          >
            <div className="p-4 flex flex-col h-full pointer-events-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-zinc-400 text-sm font-semibold">{title}</h3>
                <button onClick={onClose} className="p-2 bg-ntc rounded-full text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="bg-ntc border border-ntc-border rounded-xl p-4 mb-4 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">Weight</span>
                <span className="text-4xl font-black text-white">
                  {value || '0'} <span className="text-lg text-zinc-500">lbs</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    className={`h-16 rounded-xl flex items-center justify-center text-2xl font-bold cursor-pointer transition-all active:scale-95 ${
                      key === 'DEL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-ntc border border-ntc-border text-white hover:bg-zinc-900'
                    }`}
                  >
                    {key === 'DEL' ? <Delete size={24} /> : key}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  onSave();
                  onClose();
                }}
                className="w-full py-4 bg-white rounded-full text-black font-bold text-base items-center justify-center cursor-pointer active:scale-[0.98] transition-all"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
