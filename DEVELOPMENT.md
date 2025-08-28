# Development Guide

## 🚀 Quick Start

**Single command to start everything:**
```bash
npm start
```

This will:
1. Build the React frontend
2. Start the Express backend server
3. Serve everything from **port 3001**

## 📁 What Each Command Does

| Command | Description |
|---------|-------------|
| `npm start` | **Main command** - Builds frontend and starts server |
| `npm run dev` | Same as `npm start` |
| `npm run build` | Builds React frontend only |
| `npm run server` | Starts backend server only (requires build first) |

## 🌐 Access Points

- **Frontend Dashboard**: http://localhost:3001
- **API Endpoints**: http://localhost:3001/api/*
- **PDF Reports**: http://localhost:3001/vector_reports/*

## 🔧 Development Workflow

1. **Start development**: `npm start`
2. **Make changes** to React components (they auto-reload)
3. **Make changes** to server code (requires restart)
4. **Restart server**: `Ctrl+C` then `npm start` again

## 💡 Benefits of Consolidated Setup

- ✅ **One command** to start everything
- ✅ **Single port** (3001) for all services
- ✅ **No confusion** about which command does what
- ✅ **Easier deployment** - everything in one process
- ✅ **Simplified development** workflow

## 🚨 Important Notes

- Frontend changes auto-reload
- Backend changes require server restart
- Always use `npm start` for development
- Build files are served from `/build` directory
