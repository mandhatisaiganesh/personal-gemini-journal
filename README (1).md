# 🧠 Personal Gemini Journal

<p align="center">
  <strong>A secure, AI-powered space for thinking, journaling, brainstorming, and turning conversations into lasting insights.</strong>
</p>

<p align="center">
  <a href="https://personal-geminijournal.ai.studio">🚀 Live Application</a>
  •
  <a href="https://ai.studio/apps/a2374323-659e-490a-b95a-3dfe8bd1f9d7">✨ Google AI Studio App</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20AI%20Studio-Gemini-4285F4?style=for-the-badge&logo=google" alt="Google AI Studio">
  <img src="https://img.shields.io/badge/Firebase-Authentication-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Cloud%20Firestore-Data%20Isolation-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Cloud Firestore">
  <img src="https://img.shields.io/badge/Google%20Cloud-Production%20Ready-4285F4?style=for-the-badge&logo=googlecloud" alt="Google Cloud">
</p>

---

## ✨ Overview

**Personal Gemini Journal** is a secure, authenticated AI journaling experience designed around a simple idea:

> **Your thoughts should become useful knowledge — not disappear after a conversation.**

The application combines **Gemini-powered multi-turn conversations** with persistent personal journaling, while following a security-first architecture for authentication, data isolation, and secret management.

This project was developed for the **APAC GenAI Academy Ideathon Challenge**, whose core objective is to move beyond AI prototypes and demonstrate a production-oriented application with security built into the development process.

---

## 🎯 The Challenge

Many AI-generated applications look impressive in a demo but become risky in production when they rely on:

- Hardcoded API keys
- Weak authentication boundaries
- Shared data without proper isolation
- Client-side trust for sensitive operations
- Inadequate secret management

Personal Gemini Journal approaches the problem from the opposite direction:

```text
Security First
      ↓
Authenticated Users
      ↓
Private Journal Data
      ↓
Gemini-powered Conversations
      ↓
Persistent AI-assisted Reflection
```

---

## 🚀 Core Capabilities

### 🔐 Secure User Authentication

Users authenticate through **Firebase Authentication**, creating a clear identity boundary before accessing personal journal functionality.

### 🤖 Multi-Turn Gemini Conversations

Interact with Gemini through real conversational sessions for:

- Brainstorming
- Personal reflection
- Journaling
- Idea exploration
- Structured thinking

### 🗄️ Isolated Personal Data

Journal summaries and logs are persisted using **Cloud Firestore** with user-level isolation as a core security requirement.

The design goal is simple:

```text
User A → User A's private journal data

User B → User B's private journal data

User A ✕ User B
```

### 🔑 Secure Secret Management

Production credentials should never be hardcoded into application source code.

The intended architecture uses **Google Cloud Secret Manager** for sensitive API credentials.

### ☁️ Cloud-Native Deployment

The project is designed around a Google Cloud deployment model, with **Cloud Run** serving as the production deployment target for the challenge submission.

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │        User          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Web Application   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Firebase Auth        │
                         │ Identity Boundary    │
                         └──────────┬───────────┘
                                    │
                              Authenticated UID
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Cloud Run       │
                         │   Application/API    │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐              ┌──────────────────┐
          │  Gemini API      │              │ Cloud Firestore  │
          │ Multi-turn AI    │              │ Isolated Data    │
          └──────────────────┘              └──────────────────┘
                    ▲
                    │
          ┌──────────────────┐
          │ Secret Manager   │
          │ Secure Secrets   │
          └──────────────────┘
```

---

# 🛡️ Security-First Engineering

Security is not treated as an afterthought.

The challenge specifically emphasizes configuring Google AI Studio with production-oriented directives before generating the application.

### Security principles

- 🔐 Authentication before private-data access
- 🧱 Strong authorization boundaries
- 👤 User-level Firestore data isolation
- 🔑 No hardcoded production secrets
- ☁️ Secret Manager for sensitive credentials
- 🧪 Threat-model security-sensitive functionality
- 🛡️ Secure coding practices
- 🔒 Least-privilege mindset
- 🚫 No cross-user data access
- 📦 Production-oriented deployment

### AI Studio as the development constitution

The project follows a security-first instruction layer covering:

```text
Threat Modeling
      +
Secure Coding Standards
      +
Database Isolation
      +
Secret Management
      ↓
Security-Conscious AI-Assisted Development
```

---

# 🧩 Challenge Requirement Mapping

| Challenge Requirement | Project Implementation |
|---|---|
| Google AI Studio security configuration | Security-focused Custom Instructions |
| Firebase Authentication | Authenticated user access |
| Gemini multi-turn interaction | Conversational journaling and brainstorming |
| Cloud Firestore | Persistent journal summaries/logs |
| Zero cross-user leakage | User-isolated data model and authorization |
| Google Cloud Secret Manager | Secure credential management |
| Original enhancement | Additional AI-powered functionality beyond the base journal |
| Cloud Run | Production deployment target |

---

# 💡 Product Vision

Personal Gemini Journal is designed to evolve beyond a traditional chatbot.

The long-term product direction is:

```text
Conversation
     ↓
Reflection
     ↓
Structured Knowledge
     ↓
Insights
     ↓
Goals & Actions
     ↓
Personal Growth
```

Instead of treating every AI conversation as disposable, the journal can become a continuously growing personal knowledge layer.

---

# 🎨 Experience Philosophy

### Simple enough to use every day.
### Intelligent enough to add value.
### Secure enough to trust.

The product focuses on three principles:

**1. Personal**  
Your journal should belong to you.

**2. Intelligent**  
Gemini should help you think, not simply respond.

**3. Secure**  
Privacy and authorization should be part of the architecture, not an afterthought.

---

# 🧪 Security & Quality Checklist

Before production submission, verify:

- [ ] Firebase Authentication is enabled
- [ ] Unauthorized users cannot access private journal data
- [ ] Firestore rules enforce user-level isolation
- [ ] Client input is validated
- [ ] Gemini credentials are not hardcoded
- [ ] Sensitive credentials are stored through Secret Manager
- [ ] Production secrets are excluded from Git history
- [ ] Cloud Run configuration is verified
- [ ] Multi-user isolation has been tested
- [ ] Public repository contains no secrets
- [ ] Application works from a clean browser session

---

# 📸 Screenshots

Add your strongest product screenshots here.

Recommended screenshots:

1. Landing / authentication screen
2. Gemini journal conversation
3. Saved journal history
4. AI-generated summary
5. Security / architecture view
6. Cloud Run deployment
7. Firebase / Firestore configuration

Example:

```text
docs/
├── landing.png
├── journal.png
├── dashboard.png
├── architecture.png
└── security.png
```

---

# 🚀 Getting Started

## Prerequisites

- Google account
- Google AI Studio access
- Firebase project
- Google Cloud project
- Cloud Firestore
- Google Cloud Secret Manager
- Cloud Run
- Node.js / project runtime required by the generated application

## High-Level Setup

```bash
# Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>

# Enter the project
cd personal-gemini-journal

# Install dependencies
npm install

# Start development
npm run dev
```

> Replace the commands above with the exact commands generated by the project's final build configuration if they differ.

---

# 🌐 Live Application

**Production / Preview Application**

👉 https://personal-geminijournal.ai.studio

**Google AI Studio Project**

👉 https://ai.studio/apps/a2374323-659e-490a-b95a-3dfe8bd1f9d7

---

# 📦 Project Status

**Status:** 🚀 Active Development / Ideathon Submission

The application is being developed against the APAC GenAI Academy Ideathon requirements, with emphasis on:

- Secure AI-assisted development
- Gemini integration
- Firebase authentication
- Firestore data isolation
- Secret management
- Cloud-native deployment
- Original product enhancement

---

# 🏆 Built for the APAC GenAI Academy Ideathon

This project is built around the challenge:

> **Build a Secure "Personal Gemini Journal"**

The goal is not simply to make an AI application that works.

The goal is to demonstrate how an AI application can be designed with **security, privacy, isolation, and production-readiness from the beginning.**

---

# 👨‍💻 Author

**Sai Ganesh Mandhati**

Computer Science & Engineering — AI/ML  
AI/ML Researcher • Google Student Ambassador • Builder

Focused on:

- Generative AI
- AI Agents
- Machine Learning
- Full-Stack Development
- Secure AI Applications
- Research & Innovation

---

# 📄 License

Add your preferred open-source license before publishing the repository.

---

<p align="center">
  <strong>Built with Gemini. Designed with security. Created for real-world AI.</strong>
</p>

<p align="center">
  ⭐ If you find this project interesting, consider starring the repository.
</p>
