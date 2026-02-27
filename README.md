# SARTHI 2.0 Chatbot

A real-time, human-like voice assistant application built with a modern web stack. The application consists of a Next.js frontend for audio capture and playback, and a Node.js/Express backend that manages conversation state, intent classification, and Text-to-Speech (TTS) via ElevenLabs.

---

## 🚀 Progress Tracker

### Frontend (Next.js 14+)
- [x] **UI/UX Design** — Clean, icon-free interface with "Chocolate Truffle" light theme
- [x] **Speech-to-Text** — `useSpeechToText` hook with Web Speech API (continuous, auto-restart, cross-browser)
- [x] **WebSocket Hook** — `useWebSocket` with auto-reconnection and typed message handling
- [x] **Gapless Playback** — Web Audio API queue for seamless AI audio output
- [x] **Animations** — Pulsing orb, waveform bars, and thinking dots

### Backend (Node.js/Express)
- [x] **Architecture Scaffold** — Modular ES6 with strict separation: routes → controller → services
- [x] **FSM (Finite State Machine)** — Class-based FSM: IDLE → ONBOARDING → BOOKING → CONFIRMATION → FAQ → FAREWELL
- [x] **Intent Classification** — State-aware rule engine; swappable with an LLM classifier
- [x] **Memory / MongoDB** — Mongoose session model with indexed `sessionId`, capped history (50 turns)
- [x] **ElevenLabs TTS** — Three modes: Base64 JSON, Express stream, and **WebSocket binary stream**
- [x] **Low-Latency WebSocket Pipeline** — `isFinal` gating; text sent instantly, binary MP3 chunks piped zero-buffered
- [x] **Conversation Stability Layer** — `ActiveSessionManager` with per-session locking, sequence IDs, barge-in interruption, and `interrupt_confirmed` signal
- [x] **FSM Protection** — Abort checks before TTS and MongoDB write; state never written during interrupted requests
- [x] **Inactivity Timeout** — 60s timer per connection; resets on every `isFinal` transcript; on expiry streams soft goodbye audio and resets FSM → IDLE

### Next Steps
- [ ] **End-to-End Test** — Connect frontend WebSocket hooks to the live backend
- [ ] **LLM Integration** — Replace rule-based intent service with OpenAI/Anthropic for dynamic responses
- [ ] **Deployment** — Containerise services and prepare CI/CD pipeline

---

## 📂 Project Structure

```text
/
├── src/                        # Next.js Frontend
│   ├── app/                    # App Router (page.tsx, layout.tsx, globals.css)
│   ├── components/voice/       # MicButton, LiveTranscript, StatusIndicator, VoiceInput
│   └── hooks/                  # useVoice, useSpeechToText, useWebSocket, useAudioPlayback
└── server/                     # Node.js Backend
    ├── server.js               # Express + WebSocket entry point
    ├── config/db.js            # Mongoose connection
    ├── models/                 # user.model.js, session.model.js
    ├── controllers/            # chat.controller.js (thin orchestrator)
    ├── routes/                 # chat.routes.js
    └── services/
        ├── fsm.service.js          # Finite State Machine
        ├── intent.service.js       # Intent classifier
        ├── memory.service.js       # Session CRUD
        ├── elevenlabs.service.js   # TTS (Base64 / stream / WS binary)
        └── session-manager.service.js  # ActiveSessionManager (barge-in, lock, timeout)
```

## 💻 How to Run

### 1. Backend
```bash
cd server
cp .env.example .env      # fill MONGODB_URI and ELEVENLABS_API_KEY
npm install
npm run dev               # http://localhost:8080 | ws://localhost:8080/ws
```

### 2. Frontend
```bash
npm install
npm run dev               # http://localhost:3000
```
