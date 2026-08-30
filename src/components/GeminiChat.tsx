import { useState, useEffect, useRef } from 'react';
import { JournalEntry, ChatMessage } from '../types';
import { Send, Loader2, Sparkles, MessageCircle, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GeminiChatProps {
  entry: JournalEntry | null;
  onSendMessage: (id: string, text: string) => Promise<void>;
  isSending: boolean;
}

export default function GeminiChat({ entry, onSendMessage, isSending }: GeminiChatProps) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entry?.chat, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || inputText.trim() === '' || isSending) return;

    const messageToSend = inputText.trim();
    setInputText('');
    await onSendMessage(entry.id, messageToSend);
  };

  if (!entry) {
    return (
      <div id="chat-empty-state" className="flex flex-col items-center justify-center h-full p-6 text-center bg-neutral-50/20">
        <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-150 flex items-center justify-center mb-3">
          <MessageCircle className="w-5 h-5 text-neutral-400" />
        </div>
        <p className="text-sm font-semibold text-neutral-700">Discuss with Gemini</p>
        <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed">
          Open a journal entry first to unlock direct conversational analysis and explore details deeper.
        </p>
      </div>
    );
  }

  return (
    <div id="gemini-chat-container" className="flex flex-col h-full bg-white border-l border-neutral-150">
      {/* Chat header */}
      <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 animate-pulse shrink-0" />
        <h2 className="font-semibold text-sm text-neutral-800">Discussing: {entry.title || 'Untitled Entry'}</h2>
      </div>

      {/* Message window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {entry.chat.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <Sparkles className="w-8 h-8 text-neutral-300 mb-2" />
            <p className="text-xs font-semibold text-neutral-600">Start the Discussion</p>
            <p className="text-xs text-neutral-400 max-w-sm mt-1 leading-relaxed">
              Ask Gemini about themes, feelings, or next steps related to your journal entry. Or click on any reflection question to explore further.
            </p>
          </div>
        ) : (
          entry.chat.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border text-[10px] ${
                    isUser
                      ? 'bg-neutral-100 text-neutral-700 border-neutral-250'
                      : 'bg-neutral-900 text-white border-neutral-900'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-neutral-900 text-white rounded-tr-none'
                      : 'bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="markdown-body prose prose-sm prose-neutral max-w-none text-neutral-800">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Sending state bubble */}
        {isSending && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-neutral-900 text-white border-neutral-900">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
              <span className="text-xs text-neutral-500 font-medium">Gemini is reflecting...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input container */}
      <form onSubmit={handleSend} className="p-4 border-t border-neutral-100 flex gap-2 items-center bg-white">
        <input
          id="chat-message-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Gemini anything about this entry..."
          disabled={isSending}
          className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition"
        />
        <button
          id="send-chat-btn"
          type="submit"
          disabled={inputText.trim() === '' || isSending}
          className={`p-2.5 rounded-xl transition duration-150 cursor-pointer ${
            inputText.trim() === '' || isSending
              ? 'bg-neutral-50 text-neutral-350 border border-neutral-200 cursor-not-allowed'
              : 'bg-neutral-900 text-white hover:bg-neutral-850 shadow-xs'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
