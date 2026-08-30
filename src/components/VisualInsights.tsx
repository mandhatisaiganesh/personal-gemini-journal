import { JournalEntry } from '../types';
import { Calendar, Flame, BrainCircuit, Activity, Tag } from 'lucide-react';

interface VisualInsightsProps {
  entries: JournalEntry[];
}

export default function VisualInsights({ entries }: VisualInsightsProps) {
  // 1. Total reflections
  const totalReflections = entries.length;

  // 2. Calculating Streaks
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    // Extract unique sorted dates (YYYY-MM-DD)
    const dates = Array.from(
      new Set(
        entries.map((e) => {
          try {
            return new Date(e.createdAt).toISOString().split('T')[0];
          } catch {
            return '';
          }
        }).filter(Boolean)
      )
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending order

    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if the user wrote today or yesterday to start the streak count
    if (dates[0] !== today && dates[0] !== yesterday) {
      return 0;
    }

    let currentDate = new Date(dates[0]);
    streak = 1;

    for (let i = 1; i < dates.length; i++) {
      const nextDate = new Date(dates[i]);
      const diffTime = Math.abs(currentDate.getTime() - nextDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = nextDate;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // 3. Mood distribution
  const getMoodData = () => {
    const moods: Record<string, { count: number; color: string; bg: string }> = {};
    let totalWithMood = 0;

    entries.forEach((e) => {
      const m = e.analysis?.mood;
      if (m) {
        totalWithMood++;
        const key = m.trim();
        if (moods[key]) {
          moods[key].count++;
        } else {
          // Assign dynamic matching colors based on mood name or theme
          const theme = e.analysis?.colorTheme || 'neutral';
          let color = 'bg-neutral-600';
          let bg = 'bg-neutral-100';
          if (theme === 'indigo') { color = 'bg-indigo-600'; bg = 'bg-indigo-50'; }
          else if (theme === 'emerald') { color = 'bg-emerald-600'; bg = 'bg-emerald-50'; }
          else if (theme === 'amber') { color = 'bg-amber-600'; bg = 'bg-amber-50'; }
          else if (theme === 'rose') { color = 'bg-rose-600'; bg = 'bg-rose-50'; }
          else if (theme === 'violet') { color = 'bg-violet-600'; bg = 'bg-violet-50'; }
          else if (theme === 'sky') { color = 'bg-sky-600'; bg = 'bg-sky-50'; }

          moods[key] = { count: 1, color, bg };
        }
      }
    });

    return Object.entries(moods)
      .map(([name, { count, color, bg }]) => ({
        name,
        count,
        percentage: totalWithMood > 0 ? Math.round((count / totalWithMood) * 100) : 0,
        color,
        bg,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const moodData = getMoodData();

  // 4. Tag clouds
  const getTagData = () => {
    const tags: Record<string, number> = {};
    entries.forEach((e) => {
      e.analysis?.tags?.forEach((t) => {
        const key = t.trim().toLowerCase();
        tags[key] = (tags[key] || 0) + 1;
      });
    });

    return Object.entries(tags)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 tags
  };

  const tagData = getTagData();

  if (entries.length === 0) {
    return (
      <div id="insights-empty-state" className="flex flex-col items-center justify-center h-full p-8 text-center bg-neutral-50/20">
        <Activity className="w-8 h-8 text-neutral-300 mb-2" />
        <p className="text-sm font-semibold text-neutral-700">No Insights Available</p>
        <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed">
          Your emotional insights, well-being trends, and streaks will populate as you begin adding and analyzing journal entries.
        </p>
      </div>
    );
  }

  return (
    <div id="visual-insights-view" className="h-full overflow-y-auto p-6 bg-white space-y-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-neutral-500">
            <Calendar className="w-4 h-4" />
            <span className="text-[11px] font-medium tracking-wide uppercase">Reflections</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{totalReflections}</div>
          <div className="text-[10px] text-neutral-400 mt-1">Total journal entries logged</div>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-neutral-500">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-[11px] font-medium tracking-wide uppercase">Writing Streak</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</div>
          <div className="text-[10px] text-neutral-400 mt-1">
            {currentStreak > 0 ? "You're doing fantastic! Keep reflecting." : "Reflect daily to build habits."}
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-neutral-500">
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
            <span className="text-[11px] font-medium tracking-wide uppercase">Dominant State</span>
          </div>
          <div className="text-xl font-bold text-neutral-800 line-clamp-1">
            {moodData[0] ? moodData[0].name : 'Analyzing...'}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Primary mood pattern</div>
        </div>
      </div>

      {/* Visual analytics split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Distribution Card */}
        <div className="p-5 border border-neutral-150 rounded-xl bg-white flex flex-col gap-4">
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-neutral-500">Emotional Balance</h4>
            <p className="text-[10px] text-neutral-400 mt-0.5">Distribution of identified moods over time</p>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {moodData.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">Analyze your entries to map your emotional states.</p>
            ) : (
              moodData.map((mood) => (
                <div key={mood.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-neutral-700">
                    <span>{mood.name}</span>
                    <span>{mood.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${mood.color} rounded-full transition-all duration-500`}
                      style={{ width: `${mood.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Topics Card */}
        <div className="p-5 border border-neutral-150 rounded-xl bg-white flex flex-col gap-4">
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-neutral-500">Core Themes</h4>
            <p className="text-[10px] text-neutral-400 mt-0.5">Frequent concepts discussed in reflections</p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {tagData.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">Themes will extract automatically during analysis.</p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center py-4">
                {tagData.map((tag) => (
                  <div
                    key={tag.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-600 hover:border-neutral-300 transition duration-150"
                  >
                    <Tag className="w-3.5 h-3.5 text-neutral-400" />
                    <span>#{tag.name}</span>
                    <span className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-[9px] text-neutral-400 font-mono">
                      {tag.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
