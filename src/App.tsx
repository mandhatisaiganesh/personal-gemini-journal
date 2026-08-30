import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  arrayUnion
} from 'firebase/firestore';
import { auth, googleProvider, db } from './lib/firebase';
import { JournalEntry, ChatMessage, JournalAnalysis } from './types';
import JournalHistory from './components/JournalHistory';
import JournalEditor from './components/JournalEditor';
import GeminiChat from './components/GeminiChat';
import VisualInsights from './components/VisualInsights';
import { 
  Sparkles, 
  LogOut, 
  Loader2, 
  BookOpen, 
  Brain, 
  Menu, 
  ChevronRight, 
  MessageSquare, 
  Activity, 
  Lock, 
  User as UserIcon,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  
  // Sidebar Toggles for responsive layouts
  const [showHistoryMobile, setShowHistoryMobile] = useState(true);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'insights'>('editor');
  
  // API loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // 1. Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        setEntries([]);
        setActiveEntryId(null);
      }
    });
    return unsubscribe;
  }, []);

  // 2. Real-time entries sync for logged-in user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries: JournalEntry[] = [];
      snapshot.forEach((doc) => {
        fetchedEntries.push({ id: doc.id, ...doc.data() } as JournalEntry);
      });
      setEntries(fetchedEntries);
      
      // Auto-select the first entry if none is selected and we have entries
      if (fetchedEntries.length > 0 && !activeEntryId) {
        // Find if there's an active draft, or default to the most recent
        setActiveEntryId(fetchedEntries[0].id);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
    });

    return unsubscribe;
  }, [user]);

  // Handle Google Login
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Create new journal entry
  const handleNewEntry = async () => {
    if (!user) return;
    const newId = `entry_${Date.now()}`;
    const newEntry: Omit<JournalEntry, 'id'> = {
      userId: user.uid,
      title: 'New Reflection',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chat: [],
      isDraft: true
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'entries', newId), newEntry);
      setActiveEntryId(newId);
      setActiveTab('editor');
      // On mobile, show the editor directly when creating a new entry
      setShowHistoryMobile(false);
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  // Update entry contents (debounced auto-save triggers this)
  const handleUpdateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'entries', id), updates);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm('Are you sure you want to delete this entry and its entire reflection history?')) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'entries', id));
      if (activeEntryId === id) {
        setActiveEntryId(null);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Call server-side endpoint to generate Gemini Reflection and save
  const handleTriggerReflection = async (id: string) => {
    if (!user) return;
    const targetEntry = entries.find((e) => e.id === id);
    if (!targetEntry || targetEntry.content.trim().length < 15) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: targetEntry.content }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed.');
      }

      const analysis: JournalAnalysis = await response.json();
      await updateDoc(doc(db, 'users', user.uid, 'entries', id), {
        analysis,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting reflections:', error);
      alert('Failed to fetch Gemini reflection. Please verify your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send message in discussion chat and process Gemini response
  const handleSendMessage = async (id: string, text: string) => {
    if (!user) return;
    const targetEntry = entries.find((e) => e.id === id);
    if (!targetEntry) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    const updatedChat = [...targetEntry.chat, userMsg];

    // Optimistically update Firestore
    try {
      await updateDoc(doc(db, 'users', user.uid, 'entries', id), {
        chat: updatedChat
      });
    } catch (error) {
      console.error('Error saving user message:', error);
      return;
    }

    setIsSendingChat(true);
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryContent: targetEntry.content,
          history: targetEntry.chat, // Send previous rounds of conversation
          message: text
        })
      });

      if (!response.ok) {
        throw new Error('Chat response failed.');
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `msg_${Date.now()}_model`,
        role: 'model',
        content: data.content,
        createdAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', user.uid, 'entries', id), {
        chat: arrayUnion(modelMsg)
      });
    } catch (error) {
      console.error('Error during chat:', error);
      alert('Unable to connect with Gemini chat. Please try again.');
    } finally {
      setIsSendingChat(false);
    }
  };

  // Ask question directly from the suggest list
  const handleAskSuggestedQuestion = async (question: string) => {
    if (!activeEntryId) return;
    // On mobile, show chat sidebar directly
    setShowChatMobile(true);
    await handleSendMessage(activeEntryId, question);
  };

  const activeEntry = entries.find((e) => e.id === activeEntryId) || null;

  // Handle Loading Indicator
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50">
        <Loader2 className="w-8 h-8 text-neutral-800 animate-spin" />
        <p className="text-xs text-neutral-400 mt-3 font-medium">Checking identity state...</p>
      </div>
    );
  }

  // 1. Landing View / Login Page
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-between selection:bg-neutral-200">
        {/* Navigation */}
        <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-neutral-800">Gemini Journal</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure 256-bit Encrypted</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-6xl w-full mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12 flex-1 justify-center">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-[11px] font-semibold text-neutral-600 border border-neutral-150">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500 animate-pulse" />
              <span>Next-Gen Private Reflection Space</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-850 leading-none">
              Reflect deeper. <br />
              <span className="text-neutral-500 font-extrabold">Guided by Gemini.</span>
            </h1>
            <p className="text-sm text-neutral-500 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Personal Gemini Journal is a user-authenticated, cloud-persistent sanctuary designed to help you write reflections, map your feelings, and explore emotional depths through conversational AI insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <button
                id="google-signin-btn"
                onClick={handleSignIn}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl text-xs font-semibold transition duration-150 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.77-6.19-6.177s2.78-6.177 6.19-6.177c1.42 0 2.7.478 3.731 1.458l3.12-3.13C18.665 1.832 15.688 1 12.24 1 6.033 1 1 6.01 1 12.185S6.033 23.37 12.24 23.37c5.84 0 10.748-4.148 10.748-11.185 0-.741-.082-1.3-.231-1.9H12.24z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          {/* Interactive Feature Board */}
          <div className="w-full max-w-md p-6 bg-white border border-neutral-150 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400">Core Architecture</h3>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 mt-0.5">
                  <UserIcon className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-neutral-800">Secure Firebase Authentication</h4>
                  <p className="text-[11px] text-neutral-400">Seamless Google sign-in. Your credentials never reside on custom servers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 mt-0.5">
                  <BookOpen className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-neutral-800">User-Isolated Cloud Firestore</h4>
                  <p className="text-[11px] text-neutral-400">Private journal subcollections secured by strict Firestore security rules.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 mt-0.5">
                  <Brain className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-neutral-800">Empathic Gemini API (3.5 Flash)</h4>
                  <p className="text-[11px] text-neutral-400">Generates objective summaries, interactive deep reflection questions, and tags.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-6xl w-full mx-auto px-6 py-6 border-t border-neutral-100 text-center text-[10px] text-neutral-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Personal Gemini Journal. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Server-side Key Storage</span>
            <span>GDPR Compliant Isolation</span>
          </div>
        </footer>
      </div>
    );
  }

  // 2. Private Dashboard View
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col h-screen overflow-hidden selection:bg-neutral-200">
      {/* Top dashboard header bar */}
      <header className="bg-white border-b border-neutral-150 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile history toggle */}
          <button
            onClick={() => setShowHistoryMobile(!showHistoryMobile)}
            className="md:hidden p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-neutral-800 hidden sm:inline">Gemini Journal</span>
          </div>
        </div>

        {/* Header center tabs (Workspace vs Insights) */}
        <div className="flex bg-neutral-100 p-1 rounded-xl">
          <button
            id="tab-workspace-btn"
            onClick={() => {
              setActiveTab('editor');
              setShowHistoryMobile(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>
          <button
            id="tab-insights-btn"
            onClick={() => {
              setActiveTab('insights');
              setShowHistoryMobile(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Insights</span>
          </button>
        </div>

        {/* User context menu */}
        <div className="flex items-center gap-3">
          {/* Mobile chat sidebar toggle */}
          {activeEntryId && (
            <button
              onClick={() => setShowChatMobile(!showChatMobile)}
              className="md:hidden p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition relative cursor-pointer"
              title="Toggle Discussion"
            >
              <MessageSquare className="w-4 h-4" />
              {activeEntry?.chat && activeEntry.chat.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-neutral-950 rounded-full animate-ping" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User Profile'}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-neutral-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                {user.email?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-neutral-600 hidden lg:inline max-w-[120px] truncate">
              {user.displayName || user.email}
            </span>
          </div>

          <button
            id="signout-btn"
            onClick={handleSignOut}
            className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 rounded-lg transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: History list */}
        <aside
          className={`absolute md:relative inset-y-0 left-0 z-20 w-80 shrink-0 transform md:transform-none transition-transform duration-200 ease-in-out md:block ${
            showHistoryMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <JournalHistory
            entries={entries}
            activeEntryId={activeEntryId}
            onSelectEntry={(id) => {
              setActiveEntryId(id);
              setShowHistoryMobile(false);
            }}
            onNewEntry={handleNewEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        </aside>

        {/* Center: Main Viewport (Editor or Insights) */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {activeTab === 'editor' ? (
            <JournalEditor
              entry={activeEntry}
              onUpdateEntry={handleUpdateEntry}
              onTriggerReflection={handleTriggerReflection}
              isAnalyzing={isAnalyzing}
              onAskQuestion={handleAskSuggestedQuestion}
            />
          ) : (
            <VisualInsights entries={entries} />
          )}
        </main>

        {/* Sidebar: Chat Panel */}
        <aside
          className={`absolute md:relative inset-y-0 right-0 z-20 w-80 md:w-96 shrink-0 transform md:transform-none transition-transform duration-200 ease-in-out md:block ${
            showChatMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          }`}
        >
          {showChatMobile && (
            <button
              onClick={() => setShowChatMobile(false)}
              className="md:hidden absolute left-2 top-3 z-30 p-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-500 transition border border-neutral-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <GeminiChat
            entry={activeEntry}
            onSendMessage={handleSendMessage}
            isSending={isSendingChat}
          />
        </aside>

        {/* Overlay backdrop for mobile drawers */}
        {(showHistoryMobile || showChatMobile) && (
          <div
            className="md:hidden absolute inset-0 bg-neutral-900/10 backdrop-blur-xs z-10"
            onClick={() => {
              setShowHistoryMobile(false);
              setShowChatMobile(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
