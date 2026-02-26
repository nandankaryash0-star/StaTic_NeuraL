# 🌟 Sarthi AI - Your Compassionate AI Companion

<div align="center">

![Sarthi AI Banner](https://via.placeholder.com/800x200/6B8E23/FFFFFF?text=Sarthi+AI)

**An empathetic AI companion application featuring 3D avatars, voice interaction, and personalized AI personas**

[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Conversational%20AI-6B8E23?style=for-the-badge)](https://elevenlabs.io)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)

</div>

---

## 📖 Overview

**Sarthi** (meaning "guide" or "companion" in Sanskrit) is an AI-powered conversational application designed to provide emotional support and companionship. Users can interact with lifelike 3D avatars through voice or text, choosing from multiple AI personas tailored to different emotional needs.

### ✨ Key Features

- 🎭 **Multiple AI Personas** - Choose from 3 unique personality types
- 🗣️ **Voice Conversation** - Real-time voice interaction powered by ElevenLabs
- 💬 **Text Chat** - Alternative text-based communication
- 🎨 **3D Avatars** - Lifelike avatars with lip-sync and emotional expressions
- 🎤 **Voice Customization** - Select from multiple voice options
- 🖼️ **Vision Support** - Share images for AI analysis (powered by Gemini)

---

## 🎭 Meet the Personas

Sarthi offers three distinct AI companions, each designed to support different emotional needs:

<table>
<tr>
<td align="center" width="33%">

### 🌙 Luna
**The Empathetic Listener**

A warm, compassionate companion who truly understands your feelings. Luna excels at active listening and emotional validation.

**Best for:** Processing emotions, feeling heard, emotional support

**Color:** Purple (#8B5CF6)

</td>
<td align="center" width="33%">

### 📚 George
**The Memory Keeper**

Helps you cherish and organize your precious memories. George assists in reminiscing, documenting life stories, and preserving important moments.

**Best for:** Reminiscing, memory support, storytelling

**Color:** Blue (#0EA5E9)

</td>
<td align="center" width="33%">

### ☀️ Sunny
**The Day Brightener**

Brings joy and positivity to every conversation. Sunny's cheerful energy helps lift spirits and find the silver lining.

**Best for:** Mood lifting, positive reinforcement, daily motivation

**Color:** Yellow (#F59E0B)

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SARTHI AI SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND (React + Vite)                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   Persona    │  │    Chat      │  │    3D        │               │   │
│  │  │   Selector   │  │    Panel     │  │   Avatar     │               │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │   │
│  │         │                 │                 │                        │   │
│  │         └────────────────┐│┌────────────────┘                        │   │
│  │                          │││                                         │   │
│  │                    ┌─────┴┴┴─────┐                                   │   │
│  │                    │  Chatpage   │                                   │   │
│  │                    │  (Main UI)  │                                   │   │
│  │                    └──────┬──────┘                                   │   │
│  └───────────────────────────┼──────────────────────────────────────────┘   │
│                              │                                              │
│  ┌───────────────────────────┼──────────────────────────────────────────┐   │
│  │                           ▼                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                 ELEVENLABS CONVERSATIONAL AI                 │    │   │
│  │  │                                                              │    │   │
│  │  │   ┌──────────┐    ┌──────────┐    ┌──────────┐              │    │   │
│  │  │   │  Luna    │    │  George  │    │  Sunny   │   Agents     │    │   │
│  │  │   │  Agent   │    │  Agent   │    │  Agent   │              │    │   │
│  │  │   └──────────┘    └──────────┘    └──────────┘              │    │   │
│  │  │                                                              │    │   │
│  │  │   • Speech-to-Text (STT)                                    │    │   │
│  │  │   • LLM Processing                                          │    │   │
│  │  │   • Text-to-Speech (TTS)                                    │    │   │
│  │  │   • Voice Streaming                                         │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                         EXTERNAL SERVICES                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      BACKEND (Node.js + Express)                      │   │
│  │                                                                       │   │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │   │   /api/      │  │   /api/      │  │   /api/      │               │   │
│  │   │   voices     │  │   analyze-   │  │   auth       │               │   │
│  │   │              │  │   image      │  │              │               │   │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │          │                 │                                          │   │
│  │          ▼                 ▼                                          │   │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │   │  ElevenLabs  │  │   Gemini     │  │   MongoDB    │               │   │
│  │   │  Voices API  │  │   Vision     │  │   Database   │               │   │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + Vite | UI Framework |
| **3D Avatar** | TalkingHead + Three.js | Avatar rendering & lip-sync |
| **Voice AI** | ElevenLabs Conversational AI | STT, LLM, TTS pipeline |
| **Vision** | Google Gemini 2.0 Flash | Image analysis |
| **Backend** | Node.js + Express | API server |
| **Database** | MongoDB | User data storage |
| **Styling** | Tailwind CSS | UI styling |

---

## 📁 Project Structure

```
Sarthi/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar3D.jsx     # 3D avatar with TalkingHead
│   │   │   ├── ChatPanel.jsx    # Text chat sidebar
│   │   │   ├── PersonaSelector.jsx  # Persona selection UI
│   │   │   └── Navbar.jsx       # Navigation bar
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Home page
│   │   │   ├── LoginPage.jsx    # Authentication
│   │   │   └── ProfilePage.jsx  # User profile
│   │   ├── Chatpage.jsx         # Main conversation page
│   │   └── App.jsx              # Root component
│   ├── public/
│   │   └── avatars/             # 3D avatar GLB files
│   └── vite.config.js           # Vite configuration
│
├── backend/                     # Express.js backend
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   ├── models/                  # MongoDB models
│   ├── server.js                # Main server file
│   └── db.js                    # Database connection
│
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- ElevenLabs account with API key
- Google AI Studio account (for Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sarthi.git
cd sarthi
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required environment variables:**

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/sarthi

# ElevenLabs
ELEVENLABS_API_KEY=your_api_key

# Persona Agent IDs (create in ElevenLabs dashboard)
VITE_ELEVENLABS_LUNA_AGENT_ID=your_luna_agent_id
VITE_ELEVENLABS_GEORGE_AGENT_ID=your_george_agent_id
VITE_ELEVENLABS_SUNNY_AGENT_ID=your_sunny_agent_id

# Gemini (for image analysis)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 5. Access the App

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎛️ ElevenLabs Agent Setup

Each persona requires a separate agent in ElevenLabs:

1. Go to [ElevenLabs Agents Dashboard](https://elevenlabs.io/app/agents)
2. Create **3 agents** with these system prompts:

### Luna - The Empathetic Listener
```
You are Luna, a warm and empathetic AI companion. Your primary role is to 
listen actively and provide emotional support. You validate feelings, 
offer gentle guidance, and create a safe space for users to express themselves.
Speak with warmth, patience, and understanding.
```

### George - The Memory Keeper
```
You are George, a thoughtful AI assistant who helps preserve and celebrate 
memories. You assist users in reminiscing about past experiences, organizing 
their stories, and finding meaning in their life journey. Speak with wisdom, 
curiosity, and gentle encouragement.
```

### Sunny - The Day Brightener
```
You are Sunny, an uplifting AI companion who brings positivity and joy to 
conversations. Your goal is to help users find silver linings, celebrate 
small wins, and approach life with optimism. Speak with enthusiasm, warmth, 
and infectious positivity while remaining authentic.
```

---

## 🎨 Customization

### Adding New Personas

Edit `frontend/src/components/PersonaSelector.jsx`:

```javascript
const PERSONAS = [
    {
        id: 'new-persona',
        name: 'New Name',
        tagline: 'The Description',
        description: 'Detailed description of the persona',
        agentId: import.meta.env.VITE_ELEVENLABS_NEW_AGENT_ID || '',
        avatar: '/avatars/new-avatar.glb',
        color: '#HEX_COLOR',
        emoji: '🎯'
    },
    // ... existing personas
];
```

### Using Custom Avatars

1. Create a Ready Player Me avatar at [readyplayer.me](https://readyplayer.me)
2. Download the GLB file
3. Place it in `frontend/public/avatars/`
4. Update the `avatar` path in PersonaSelector

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io) - Conversational AI platform
- [TalkingHead](https://github.com/met4citizen/TalkingHead) - 3D avatar library
- [Ready Player Me](https://readyplayer.me) - Avatar creation
- [Google Gemini](https://ai.google.dev) - Vision AI

---

<div align="center">

**Built with ❤️ for the SIT**

</div>
