import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// Lazy-loaded Gemini SDK Instance
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

// 1. Endpoint: Analyze and Reflect on Journal Entry
app.post('/api/gemini/reflect', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim() === '') {
      res.status(400).json({ error: 'Journal content is required.' });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = 
      "You are an exceptionally empathetic, insightful, and supportive journaling assistant. " +
      "Analyze the user's journal text. Provide an objective, comforting summary, " +
      "identify 3 deep open-ended reflection prompts or insights to help them unpack their thoughts, " +
      "and generate 2 to 4 relevant tags. Also identify the overall emotional mood (one word) and " +
      "recommend an associated UI color theme (one of: 'indigo', 'emerald', 'amber', 'rose', 'violet', 'sky'). " +
      "Strictly output the response as JSON adhering to the specified schema.";

    const prompt = `Please reflect on and analyze this journal entry:\n\n"""\n${content}\n"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: { 
              type: 'STRING',
              description: 'A warm, highly validating and concise summary of the entry.'
            },
            insights: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: '2 to 3 comforting observations or constructive, open-ended journal prompts.'
            },
            tags: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: '2 to 4 keywords/tags capturing the core themes.'
            },
            mood: { 
              type: 'STRING',
              description: 'The overall mood (e.g. Joyful, Pensive, Anxious, Overwhelmed, Peace, Tired).'
            },
            colorTheme: { 
              type: 'STRING',
              description: 'UI color key that matches the mood: indigo, emerald, amber, rose, violet, or sky.'
            }
          },
          required: ['summary', 'insights', 'tags', 'mood', 'colorTheme']
        },
        systemInstruction,
        temperature: 0.6,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini API.');
    }

    const data = JSON.parse(responseText);
    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/gemini/reflect:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred during reflection generation.' 
    });
  }
});

// 2. Endpoint: Conversation about the Journal Entry
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { history, entryContent, message } = req.body;
    
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = 
      "You are Gemini, a warm, professional, and empathetic personal journaling assistant and confidant. " +
      "You are discussing a specific journal entry with the user. " +
      "Keep your responses thoughtful, highly encouraging, relatively concise, and focused on helping " +
      "the user explore their thoughts in a safe space. Avoid lecturing, giving clinical advice, " +
      "or using standard AI introductory/concluding clichés. Always treat the user with validation and respect.";

    // Build history format required by GenAI SDK
    const contents: any[] = [];

    // Provide context of the original entry first
    if (entryContent) {
      contents.push({
        role: 'user',
        parts: [{ text: `Here is my journal entry for context:\n"""\n${entryContent}\n"""` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: "Thank you for sharing your entry. I have read and understood it. Let's discuss it—how can I support you or what aspect would you like to explore?" }]
      });
    }

    // Add chat history
    if (Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ content: response.text || "I'm listening and here for you." });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred during the chat interaction.' 
    });
  }
});

// Serve frontend with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
