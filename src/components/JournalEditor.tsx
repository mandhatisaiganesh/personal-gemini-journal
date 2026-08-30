import { useState, useEffect, useRef } from 'react';
import { JournalEntry, JournalAnalysis } from '../types';
import { Sparkles, Loader2, Save, Sparkle, Tag, HelpCircle, AlertCircle } from 'lucide-react';

interface JournalEditorProps {
  entry: JournalEntry | null;
  onUpdateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  onTriggerReflection: (id: string) => Promise<void>;
  isAnalyzing: boolean;
  onAskQuestion: (question: string) => void;
}

export default function JournalEditor({
  entry,
  onUpdateEntry,
  onTriggerReflection,
  isAnalyzing,
  onAskQuestion,
}: JournalEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize local state with active entry changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [entry?.id]);

  // Handle auto-saving on content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (!entry) return;

    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onUpdateEntry(entry.id, { content: newContent, updatedAt: new Date().toISOString() });
      setIsSaving(false);
    }, 800); // 800ms debounce
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!entry) return;

    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onUpdateEntry(entry.id, { title: newTitle, updatedAt: new Date().toISOString() });
      setIsSaving(false);
    }, 800);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;

  if (!entry) {
    return (
      <div id="editor-empty-state" className="flex flex-col items-center justify-center h-full p-8 text-center bg-neutral-50/30">
        <div className="w-16 h-16 rounded-full bg-white border border-neutral-150 flex items-center justify-center shadow-xs mb-4">
          <Sparkles className="w-6 h-6 text-neutral-400" />
        </div>
        <h3 className="text-base font-semibold text-neutral-700">Write Your Mind</h3>
        <p className="text-xs text-neutral-400 max-w-sm mt-1 leading-relaxed">
          Select an entry from the sidebar or start a new draft to reflect, analyze, and converse with Gemini.
        </p>
      </div>
    );
  }

  // Determine dynamic colors matching entry theme from Gemini
  const theme = entry.analysis?.colorTheme || 'neutral';
  const colors = (() => {
    switch (theme) {
      case 'indigo':
        return {
          bg: 'bg-indigo-50/40 border-indigo-100',
          text: 'text-indigo-900',
          accent: 'bg-indigo-900 hover:bg-indigo-950 text-white',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          bullet: 'bg-indigo-500',
          ripple: 'hover:bg-indigo-50'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50/40 border-emerald-100',
          text: 'text-emerald-900',
          accent: 'bg-emerald-900 hover:bg-emerald-950 text-white',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          bullet: 'bg-emerald-500',
          ripple: 'hover:bg-emerald-50'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50/40 border-amber-100',
          text: 'text-amber-900',
          accent: 'bg-amber-900 hover:bg-amber-950 text-white',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          bullet: 'bg-amber-500',
          ripple: 'hover:bg-amber-50'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50/40 border-rose-100',
          text: 'text-rose-900',
          accent: 'bg-rose-900 hover:bg-rose-950 text-white',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          bullet: 'bg-rose-500',
          ripple: 'hover:bg-rose-50'
        };
      case 'violet':
        return {
          bg: 'bg-violet-50/40 border-violet-100',
          text: 'text-violet-900',
          accent: 'bg-violet-900 hover:bg-violet-950 text-white',
          badge: 'bg-violet-50 text-violet-700 border-violet-200',
          bullet: 'bg-violet-500',
          ripple: 'hover:bg-violet-50'
        };
      case 'sky':
        return {
          bg: 'bg-sky-50/40 border-sky-100',
          text: 'text-sky-900',
          accent: 'bg-sky-900 hover:bg-sky-950 text-white',
          badge: 'bg-sky-50 text-sky-700 border-sky-200',
          bullet: 'bg-sky-500',
          ripple: 'hover:bg-sky-50'
        };
      default:
        return {
          bg: 'bg-neutral-50/60 border-neutral-150',
          text: 'text-neutral-900',
          accent: 'bg-neutral-900 hover:bg-neutral-850 text-white',
          badge: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          bullet: 'bg-neutral-500',
          ripple: 'hover:bg-neutral-100'
        };
    }
  })();

  return (
    <div id="journal-editor-workspace" className="flex flex-col h-full bg-white">
      {/* Editor top meta */}
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">
            {wordCount} words
          </span>
          <span className="text-neutral-300">•</span>
          <div className="flex items-center gap-1">
            <Save className="w-3 h-3 text-neutral-400" />
            <span className="text-xs text-neutral-400 font-mono">
              {isSaving ? 'Autosaving...' : 'All changes saved'}
            </span>
          </div>
        </div>

        {/* Gemini Reflect Trigger */}
        <button
          id="reflect-gemini-btn"
          disabled={content.trim().length < 15 || isAnalyzing}
          onClick={() => onTriggerReflection(entry.id)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 shadow-xs cursor-pointer ${
            content.trim().length < 15
              ? 'bg-neutral-100 text-neutral-400 border border-neutral-150 cursor-not-allowed'
              : colors.accent
          }`}
          title={content.trim().length < 15 ? 'Write at least 15 characters to reflect' : 'Get Gemini Reflections'}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing entry...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reflect with Gemini</span>
            </>
          )}
        </button>
      </div>

      {/* Main split viewport (Editor + Gemini insights) */}
      <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-100">
        {/* Input workspace */}
        <div className="flex-1 p-6 flex flex-col gap-4 min-h-[300px]">
          <input
            id="entry-title-input"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Give this reflection a title..."
            className="w-full text-xl font-bold text-neutral-800 placeholder-neutral-300 focus:outline-none tracking-tight border-b border-transparent hover:border-neutral-100 focus:border-neutral-200 transition pb-2"
          />

          <textarea
            id="entry-content-textarea"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="How was your day? What's on your mind? Spill your thoughts, feelings, and questions, then let Gemini help you analyze them..."
            className="w-full flex-1 text-sm text-neutral-700 placeholder-neutral-300 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Analysis side shelf */}
        <div className="w-full md:w-80 p-6 bg-neutral-50/40 flex flex-col gap-5 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs tracking-wider uppercase text-neutral-500 flex items-center gap-1.5">
              <Sparkle className="w-3.5 h-3.5 text-neutral-400" />
              Gemini Insights
            </h4>
            {entry.analysis?.mood && (
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${colors.badge}`}>
                {entry.analysis.mood}
              </span>
            )}
          </div>

          {/* Prompt constraint error warning */}
          {content.trim().length < 15 && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex gap-2">
              <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Write a bit more (15+ characters) to activate the <strong>Reflect with Gemini</strong> engine.
              </p>
            </div>
          )}

          {/* Analysis content state */}
          {entry.analysis ? (
            <div className="space-y-5">
              {/* Summary */}
              <div id="reflection-summary-box" className={`p-4 rounded-xl border ${colors.bg}`}>
                <h5 className="font-bold text-xs text-neutral-800 mb-1.5">Empathetic Synthesis</h5>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  {entry.analysis.summary}
                </p>
              </div>

              {/* Reflection Questions */}
              {entry.analysis.insights && entry.analysis.insights.length > 0 && (
                <div className="space-y-2.5">
                  <h5 className="font-bold text-xs text-neutral-800 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                    Explore Deeper
                  </h5>
                  <div className="space-y-2">
                    {entry.analysis.insights.map((insight, idx) => (
                      <button
                        key={idx}
                        onClick={() => onAskQuestion(insight)}
                        className={`w-full text-left p-3 bg-white border border-neutral-150 rounded-xl text-xs text-neutral-600 hover:text-neutral-900 shadow-2xs hover:shadow-xs transition duration-150 flex items-start gap-2.5 group cursor-pointer ${colors.ripple}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.bullet} shrink-0 mt-1.5`} />
                        <span className="leading-relaxed group-hover:underline">
                          {insight}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag clouds */}
              {entry.analysis.tags && entry.analysis.tags.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-neutral-800 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-400" />
                    Thematic Tags
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.analysis.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-150 rounded-md text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div id="no-analysis-placeholder" className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-6 h-6 text-neutral-300 mb-2" />
              <p className="text-xs text-neutral-400 max-w-[180px] leading-relaxed">
                {isAnalyzing 
                  ? "Gemini is deeply analyzing your reflection..." 
                  : "Click 'Reflect with Gemini' to generate summaries, core themes, and open-ended exploration prompts."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
