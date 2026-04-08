import React from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { YakumanType } from '@/types';
import {
  YAKUMAN_LIST,
  getCompatibleYakuman,
  getIncompatibleWith,
  getYakumanMultiplierLabel,
} from '@/utils/yakumanCompatibility';

interface YakumanSelectorProps {
  selected: YakumanType[];
  onChange: (yakuman: YakumanType[]) => void;
}

export const YakumanSelector: React.FC<YakumanSelectorProps> = ({
  selected,
  onChange,
}) => {
  const compatible = getCompatibleYakuman(selected);

  const toggle = (yakuman: YakumanType) => {
    if (!compatible[yakuman]) return;
    if (navigator.vibrate) navigator.vibrate(10);
    if (selected.includes(yakuman)) {
      onChange(selected.filter((y) => y !== yakuman));
    } else {
      onChange([...selected, yakuman]);
    }
  };

  const multiplierLabel = getYakumanMultiplierLabel(selected.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/70">役満を選択</p>
        <AnimatePresence>
          {multiplierLabel && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="px-3 py-1 bg-danger/20 border border-danger/50 rounded-full text-xs font-bold text-danger"
            >
              {multiplierLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {YAKUMAN_LIST.map((yakuman) => {
          const isSelected = selected.includes(yakuman);
          const isDisabled = !compatible[yakuman];
          const incompatibles = isDisabled ? getIncompatibleWith(yakuman).filter((y) => selected.includes(y)) : [];

          return (
            <button
              key={yakuman}
              onClick={() => toggle(yakuman)}
              disabled={isDisabled}
              title={isDisabled ? `${incompatibles.join('・')}と複合できません` : undefined}
              className={`
                relative p-3 rounded-xl border text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-accent/20 border-accent text-accent shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : isDisabled
                    ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 text-accent text-xs"
                >
                  <Check className="w-3 h-3" />
                </motion.span>
              )}
              {yakuman}
              {isDisabled && (
                <span className="block text-[9px] mt-0.5 text-white/30">複合不可</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
