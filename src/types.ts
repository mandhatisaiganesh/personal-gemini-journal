export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface JournalAnalysis {
  summary: string;
  insights: string[];
  tags: string[];
  mood: string;
  colorTheme: string; // Dynamic color theme based on entry mood (e.g., 'indigo', 'emerald', 'amber', 'rose')
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  analysis?: JournalAnalysis;
  chat: ChatMessage[];
  isDraft: boolean;
}
