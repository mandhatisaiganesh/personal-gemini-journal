import { useState } from 'react';
import { JournalEntry } from '../types';
import { Search, Calendar, Tag, Trash2, Plus, Smile, BookOpen } from 'lucide-react';

interface JournalHistoryProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onDeleteEntry: (id: string, e: React.MouseEvent) => void;
}

export default function JournalHistory({
  entries,
  activeEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
}: JournalHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      entries.flatMap((entry) => entry.analysis?.tags || [])
    )
  ).filter(Boolean);

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.analysis?.summary && entry.analysis.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = !selectedTag || (entry.analysis?.tags && entry.analysis.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const getMoodConfig = (mood?: string) => {
    if (!mood) return { bg: 'bg-neutral-100 text-neutral-600 border-neutral-200', icon: '📝' };
    const m = mood.toLowerCase();
    if (m.includes('joy') || m.includes('happy') || m.includes('excit')) 
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: '☀️' };
    if (m.includes('peace') || m.includes('calm') || m.includes('serene')) 
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🍃' };
    if (m.includes('pens') || m.includes('sad') || m.includes('reflect') || m.includes('melan')) 
      return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🌙' };
    if (m.includes('anx') || m.includes('fear') || m.includes('worr')) 
      return { bg: 'bg-violet-50 text-violet-700 border-violet-200', icon: '☁️' };
    if (m.includes('overwhelmed') || m.includes('stress') || m.includes('tire')) 
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: '⛈️' };
    return { bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: '✨' };
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="journal-history-container" className="flex flex-col h-full bg-white border-r border-neutral-150">
      {/* Header section with Action */}
      <div className="p-4 border-b border-neutral-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-700" />
            <h2 className="font-semibold text-lg text-neutral-800">Your Journal</h2>
          </div>
          <button
            id="new-entry-btn"
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-white rounded-lg text-sm font-medium transition duration-150 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Write Entry</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            id="journal-search-input"
            type="text"
            placeholder="Search entries, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition"
          />
        </div>
      </div>

      {/* Tag Filtering Bar */}
      {allTags.length > 0 && (
        <div className="px-4 py-2 border-b border-neutral-100 flex gap-1.5 overflow-x-auto scrollbar-none items-center">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition shrink-0 cursor-pointer ${
              !selectedTag
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition flex items-center gap-1 shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <BookOpen className="w-8 h-8 text-neutral-300 mb-2" />
            <p className="text-sm font-medium text-neutral-500">No entries found</p>
            <p className="text-xs text-neutral-400 mt-1">
              {entries.length === 0
                ? "Start writing your very first reflection!"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isActive = entry.id === activeEntryId;
            const mood = getMoodConfig(entry.analysis?.mood);
            return (
              <div
                id={`entry-card-${entry.id}`}
                key={entry.id}
                onClick={() => onSelectEntry(entry.id)}
                className={`group p-3.5 rounded-xl border text-left transition duration-200 relative cursor-pointer ${
                  isActive
                    ? 'bg-neutral-50 border-neutral-400 shadow-sm'
                    : 'bg-white border-neutral-200 hover:border-neutral-350 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-neutral-800 text-sm line-clamp-1 group-hover:text-neutral-900 pr-5">
                    {entry.title || 'Untitled Entry'}
                  </h3>
                  <button
                    id={`delete-entry-btn-${entry.id}`}
                    onClick={(e) => onDeleteEntry(entry.id, e)}
                    className="absolute right-3 top-3.5 text-neutral-400 hover:text-rose-500 p-1 rounded-md hover:bg-neutral-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition duration-150"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-neutral-500 line-clamp-2 mb-2.5 pr-2 leading-relaxed">
                  {entry.content || <em className="text-neutral-400">Empty draft...</em>}
                </p>

                <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    <span>{formatDate(entry.createdAt)}</span>
                  </div>

                  {entry.analysis?.mood && (
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium flex items-center gap-1 ${mood.bg}`}>
                      <span>{mood.icon}</span>
                      <span>{entry.analysis.mood}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
