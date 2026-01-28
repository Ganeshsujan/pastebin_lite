# Vercel Deployment Guide

## Project Structure for Serverless

```
pastebins/
├── api/
│   └── index.js           # ← Vercel serverless entry point (exports Express app)
├── lib/
│   └── db.js              # ← MongoDB connection helper (singleton pattern)
├── routes/                # ← All routes (unchanged)
├── models/                # ← All MongoDB models (unchanged)
├── views/                 # ← EJS templates (unchanged)
├── utils/                 # ← Helper utilities (unchanged)
├── server.js              # ← Local dev server (npm start)
├── package.json
├── vercel.json            # ← Vercel configuration
└── .env.example           # ← Environment variables reference
```

## How It Works

### Vercel Deployment
- **Entry Point**: `api/index.js`
- **Handler**: Express app exported as serverless function
- **MongoDB**: Lazy connection with global caching (no buffering issues)
- **Connection Reuse**: Cached connection persists across invocations

### Local Development
- **Server**: `server.js` (uses `server.js` entry point)
- **MongoDB**: Direct connection with full lifecycle management
- **Commands**:
  ```bash
  npm start       # Start local server
  npm run dev     # Development mode with nodemon (if configured)
  npm test        # Test mode
  ```

## Environment Variables

Add to Vercel dashboard:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pastebin-lite?retryWrites=true&w=majority
```

Local development (`.env.local`):
```
MONGO_URI=mongodb://localhost:27017/pastebin-lite
```

## Key Improvements for Serverless

1. **Removed Startup Logic**
   - ❌ `require('dotenv').config()` in api/index.js
   - ❌ `app.listen()` in api/index.js
   - ❌ `process.on('SIGINT')` in api/index.js

2. **Connection Pooling**
   - ✅ Singleton pattern in `lib/db.js`
   - ✅ `bufferCommands: false` prevents buffering timeout
   - ✅ `serverSelectionTimeoutMS: 10000` for reliability
   - ✅ Connection cached globally across requests

3. **Lazy MongoDB Connection**
   - ✅ Connects on first request only
   - ✅ No startup delays
   - ✅ Vercel timeouts avoided

4. **Preserved Business Logic**
   - ✅ All routes unchanged
   - ✅ All models unchanged
   - ✅ All utilities unchanged

## Deployment Steps

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add `MONGO_URI` environment variable
   - Deploy

3. **Access Your App**:
   - Your Vercel URL (e.g., `https://pastebin-lite.vercel.app`)
   - All routes work from root path

## Testing Locally Before Deployment

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Node server
npm start
```

Visit `http://localhost:3000`

## Troubleshooting

**MongoDB Connection Timeout**
- Check `MONGO_URI` in Vercel dashboard
- Ensure IP whitelist includes Vercel IPs
- Verify MongoDB Atlas has production cluster configured

**Buffer Command Timeout**
- ✅ Already fixed: `bufferCommands: false` in `lib/db.js`

**Routes Not Working**
- ✅ Vercel routes configured to forward all traffic to `api/index.js`
- Check `vercel.json` for correct routing

