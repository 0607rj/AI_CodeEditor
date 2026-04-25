# 🚀 Antigravity AI Code Editor

An AI-powered code editor built with the MERN stack, featuring intelligent code analysis, interactive dependency graphs, and developer decision memory.

![Status](https://img.shields.io/badge/status-active-success)
![Tech](https://img.shields.io/badge/stack-MERN-blue)
![AI](https://img.shields.io/badge/AI-Gemini-brightgreen)

## ✨ Features

### 🔍 Intent Mode
- AI-powered code analysis and optimization
- Detects bugs, bad practices, and performance issues
- Generates optimized code with diff view
- Suggests folder structure improvements

### 📊 Codebase Explainer
- AST-based code parsing (Babel)
- Interactive dependency graphs (React Flow)
- Multi-file relationship mapping
- AI-generated explanations

### 🧠 Decision Memory
- Store developer decisions with context
- Tag-based organization
- Full-text search
- Timestamped history

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS, Monaco Editor |
| Backend | Node.js, Express |
| Database | MongoDB |
| AI | Google Gemini API |
| Visualization | React Flow (@xyflow/react) |
| Parsing | @babel/parser + @babel/traverse |

## 📦 Setup

### Prerequisites
- Node.js v20+
- MongoDB (local or Atlas)
- Google Gemini API key ([Get one free](https://aistudio.google.com/apikey))

### Installation

```bash
# 1. Clone and install all dependencies
npm run install-all

# 2. Configure environment
# Edit .env in the root directory:
MONGODB_URI=mongodb://localhost:27017/antigravity
GEMINI_API_KEY=your_api_key_here
PORT=5000

# 3. Start development (runs both client & server)
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## 🏗️ Architecture

```
AI_CodeEditor/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API layer
│   │   └── utils/          # Helpers
│   └── ...
├── server/                 # Express backend
│   ├── config/             # DB connection
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Error handling
│   ├── models/             # Mongoose schemas
│   ├── prompts/            # AI prompt templates
│   ├── routes/             # API routes
│   └── services/           # Business logic
└── .env                    # Environment variables
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze-code` | Analyze code with AI (Intent Mode) |
| POST | `/api/explain-codebase` | Parse and explain code/codebase |
| POST | `/api/store-memory` | Save a developer decision |
| GET | `/api/get-memory` | Query past decisions |
| DELETE | `/api/delete-memory/:id` | Remove a decision |
| GET | `/api/health` | Server health check |

## 🎨 Design

- **Theme**: Premium dark IDE aesthetic
- **Colors**: Deep navy background, cyan + violet accents
- **Typography**: Inter (UI), JetBrains Mono (code)
- **Effects**: Glassmorphism, animated borders, smooth transitions

## 📝 License

MIT
