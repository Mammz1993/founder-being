import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalReflection } from '../types';
import { Sparkles, Compass, Send, Trash2, Heart, Award } from 'lucide-react';

const STATIC_REFLECTIONS: JournalReflection[] = [
  {
    id: 'static-1',
    text: "Just completed our series A. Everyone is celebrating, but all I can feel is the massive weight of 40 new livelihoods depending on my next decision. It's incredibly isolated.",
    category: 'Isolation',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    reactions: 14
  },
  {
    id: 'static-2',
    text: "We missed our Q2 targets. The board was decent about it, but the constant feeling of letting people down is causing my stomach to knot up every morning.",
    category: 'Pressure',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    reactions: 22
  },
  {
    id: 'static-3',
    text: "Spent 4 days in our regional hub gathering without checking Slack. For the first time in five years, my nervous system felt like it stepped out of constant survival mode.",
    category: 'Clarity',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    reactions: 31
  }
];

export default function InteractiveJournal() {
  const [reflections, setReflections] = useState<JournalReflection[]>([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<JournalReflection['category']>('Pressure');
  const [isLettingGo, setIsLettingGo] = useState(false);
  const [dissolvedText, setDissolvedText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Load reflections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('founder_reflections');
    if (stored) {
      try {
        setReflections(JSON.parse(stored));
      } catch (e) {
        setReflections(STATIC_REFLECTIONS);
      }
    } else {
      setReflections(STATIC_REFLECTIONS);
      localStorage.setItem('founder_reflections', JSON.stringify(STATIC_REFLECTIONS));
    }
  }, []);

  const saveReflections = (updated: JournalReflection[]) => {
    setReflections(updated);
    localStorage.setItem('founder_reflections', JSON.stringify(updated));
  };

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLettingGo(true);
    setDissolvedText(text);

    // After fade animation, add to list (simulates releasing it to the silent waters)
    setTimeout(() => {
      const newRef: JournalReflection = {
        id: `ref-${Date.now()}`,
        text: text,
        category: category,
        createdAt: new Date().toISOString(),
        reactions: 0
      };
      
      const updated = [newRef, ...reflections];
      saveReflections(updated);
      setText('');
      setIsLettingGo(false);
    }, 2500); // Duration matches cinematic fadeout timeline
  };

  const handleReact = (id: string) => {
    const updated = reflections.map(r => {
      if (r.id === id) {
        return { ...r, reactions: r.reactions + 1 };
      }
      return r;
    });
    saveReflections(updated);
  };

  const handleDelete = (id: string) => {
    // Only allow deleting user creations, mock or actual
    const updated = reflections.filter(r => r.id !== id);
    saveReflections(updated);
  };

  const categories: JournalReflection['category'][] = ['Pressure', 'Isolation', 'Expectation', 'Clarity', 'Hope'];

  const filteredReflections = filterCategory === 'All' 
    ? reflections 
    : reflections.filter(r => r.category === filterCategory);

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800/60 bg-white/70 dark:bg-stone-900/40 backdrop-blur-xl p-6 md:p-8 shadow-sm">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono tracking-[0.2em] text-amber-800 dark:text-amber-500 uppercase">
            Silent Practice
          </span>
          <h3 className="text-2xl md:text-3xl font-display font-light text-stone-900 dark:text-stone-100 mt-2">
            The Reflection Board
          </h3>
          <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 mt-2 max-w-lg mx-auto font-normal">
            A space to lay down the weights you carry. Write what is clouding your clarity, select a focus, and release it into the collective board.
          </p>
        </div>

        {/* Cinematic Letting Go Animation Layer */}
        <div className="relative min-h-[160px] mb-8 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white/55 dark:bg-stone-950/40 p-5 flex flex-col justify-between shadow-inner">
          <AnimatePresence mode="wait">
            {isLettingGo ? (
              <motion.div
                key="dissolving"
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -40, scale: 0.96, filter: 'blur(8px)' }}
                transition={{ duration: 2.2, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0 p-5 flex flex-col justify-center items-center text-center bg-stone-950/80 text-white z-20"
              >
                <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase mb-4 animate-pulse">
                  Releasing Into Silence...
                </span>
                <p className="font-sans italic text-base font-light text-stone-200 max-w-xl px-4 select-none">
                  “{dissolvedText}”
                </p>
                <div className="mt-4 flex gap-1 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-600 delay-150"></span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <form onSubmit={handleRelease} className="space-y-4">
            <div>
              <label htmlFor="reflection-input" className="sr-only">Your reflection</label>
              <textarea
                id="reflection-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={280}
                placeholder="What startup weight or truth are you currently carrying? (e.g. Loneliness in leadership, fatigue, doubt...)"
                className="w-full min-h-[90px] bg-transparent border-0 placeholder-stone-500 dark:placeholder-stone-400 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-0 text-sm md:text-base font-sans resize-none font-normal py-1"
                disabled={isLettingGo}
              />
              <div className="text-right text-[10px] font-mono text-stone-800 dark:text-stone-300 font-medium">
                {text.length}/280
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-200 dark:border-stone-800/80">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-stone-850 dark:text-stone-300 mr-1.5 font-semibold">Category:</span>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={isLettingGo}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                      category === cat 
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' 
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-900/60 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 font-normal'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!text.trim() || isLettingGo}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-tight transition-all cursor-pointer ${
                  text.trim() && !isLettingGo
                    ? 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white border border-stone-900 dark:border-stone-100 font-medium'
                    : 'bg-stone-200 text-stone-750 dark:bg-stone-900/60 dark:text-stone-500 border border-transparent cursor-not-allowed font-medium'
                }`}
                id="release-reflection-btn"
              >
                <span>Release</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>

        {/* Collective Feed Grid */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-900 pb-3">
            <h4 className="text-xs font-mono uppercase tracking-[0.1em] text-stone-700 dark:text-stone-300 font-medium">
              Silent Board Feed (Anonymous)
            </h4>
            
            {/* Filter buttons */}
            <div className="flex items-center gap-1">
              {['All', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    filterCategory === cat
                      ? 'text-stone-900 dark:text-white font-medium bg-stone-300/60 dark:bg-stone-850/40'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-normal'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence initial={false}>
              {filteredReflections.map((ref) => {
                const isStatic = ref.id.startsWith('static-');
                return (
                  <motion.div
                    key={ref.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="p-5 rounded-xl border border-stone-200 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/20 flex flex-col justify-between space-y-4 hover:border-stone-300 dark:hover:border-stone-700/65 transition-all group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-stone-200/50 dark:bg-stone-900/80 text-stone-850 dark:text-stone-300 font-bold">
                          {ref.category}
                        </span>
                        <span className="text-[9px] font-mono text-stone-750 dark:text-stone-400 font-medium">
                          {new Date(ref.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-900 dark:text-stone-200 font-normal leading-relaxed">
                        “{ref.text}”
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-900/40">
                      <button
                        onClick={() => handleReact(ref.id)}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-stone-800 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors font-semibold group-hover:text-stone-950"
                        title="Metta (Loving-kindness) alignment"
                      >
                        <Heart className="w-3.5 h-3.5 fill-none stroke-current" />
                        <span>Resonate ({ref.reactions})</span>
                      </button>

                      {!isStatic && (
                        <button
                          onClick={() => handleDelete(ref.id)}
                          className="text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 cursor-pointer text-[10px] font-mono flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
                          title="Erase"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Erase</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredReflections.length === 0 && (
              <div className="col-span-full py-12 text-center text-stone-400 dark:text-stone-600 font-mono text-xs">
                The silence is absolute. No reflections in this alignment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
