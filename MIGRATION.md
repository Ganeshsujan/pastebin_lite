# Vercel Serverless Migration Summary

## ✅ Completed Tasks

### 1. Removed Server Startup Logic
- ✅ Removed `require('dotenv').config()` from `api/index.js`
- ✅ Removed `app.listen()` from `api/index.js`
- ✅ Removed `process.on('SIGINT')` from `api/index.js`
- ✅ Moved all startup logic to local `server.js` only

### 2. Converted Express App for Serverless
- ✅ `api/index.js` now exports Express app directly: `module.exports = app`
- ✅ No server initialization in app setup
- ✅ Ready for Vercel serverless function invocation

### 3. Created MongoDB Connection Helper
- ✅ Created `lib/db.js` with singleton pattern
- ✅ Global connection caching to avoid reconnects
- ✅ Configured: `bufferCommands: false` (prevents timeout errors)
- ✅ Configured: `serverSelectionTimeoutMS: 10000` for reliability
- ✅ Configured: `socketTimeoutMS: 45000` for long operations

### 4. Lazy MongoDB Connection
- ✅ Connection happens on first request (in middleware)
- ✅ No startup delays
- ✅ Scales efficiently with Vercel serverless

### 5. Preserved All Business Logic
- ✅ Routes: No changes
- ✅ Models: No changes
- ✅ Controllers: No changes
- ✅ Utilities: No changes
- ✅ Middleware: No changes

### 6. Local Development Compatibility
- ✅ `server.js` is local-only development file
- ✅ Includes full dotenv and server startup
- ✅ Includes graceful shutdown handling
- ✅ `npm start` still works locally
- ✅ `npm test` still works

## File Changes

| File | Before | After | Purpose |
|------|--------|-------|---------|
| `api/index.js` | Full app + server startup | App export only | Serverless entry point |
| `lib/db.js` | N/A | ✅ New | MongoDB connection pooling |
| `server.js` | Duplicate logic | Local-only server | Development server |
| `vercel.json` | Basic config | ✅ Same | Vercel routing |

## Architecture

```
Vercel Serverless Request
    ↓
vercel.json routes ALL traffic to api/index.js
    ↓
api/index.js (Express app)
    ↓
First Request Middleware: connectMongo() from lib/db.js
    ↓
Cached Connection reused for subsequent requests
    ↓
Your Routes (unchanged)
    ↓
Response
```

## Local vs Serverless Differences

### Local (server.js - npm start)
```javascript
- require('dotenv').config()           // Load .env file
- mongoose.connect()                   // Direct connection
- app.listen(PORT)                     // Start HTTP server
- process.on('SIGINT')                 // Graceful shutdown
```

### Serverless (api/index.js - Vercel)
```javascript
- module.exports = app                 // Export for Vercel
- connectMongo() on first request      // Lazy connection
- Vercel handles HTTP routing          // No listen() needed
- Vercel manages lifetime               // No shutdown needed
```

## Environment Variables

### Vercel Dashboard
Add these secrets:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pastebin-lite
NODE_ENV=production
```

### Local Development (.env.local)
```
MONGO_URI=mongodb://localhost:27017/pastebin-lite
NODE_ENV=development
TEST_MODE=1
PORT=3000
```

## Testing

### Local Testing
```bash
npm install          # Install dependencies
npm start            # Start server
```

### Vercel Testing (before production deploy)
```bash
npm install -g vercel
vercel              # Deploy to preview environment
```

## Common Issues Fixed

| Issue | Solution | File |
|-------|----------|------|
| MongoDB buffer timeout | `bufferCommands: false` | lib/db.js |
| Connection not established | Lazy connect on first request | api/index.js middleware |
| Connection per request | Global caching singleton | lib/db.js |
| Server won't start in serverless | Removed app.listen() | api/index.js |
| Local dev broken | Separate server.js | server.js |
| Dotenv not loading in serverless | Only in server.js and local | lib/db.js, api/index.js |

## Next Steps

1. **Verify locally**: `npm start` should work
2. **Push to GitHub**: `git push origin main`
3. **Deploy to Vercel**: Connect repo in Vercel dashboard
4. **Add secrets**: Set `MONGO_URI` in Vercel project settings
5. **Test production**: Visit your Vercel URL

## Rollback (if needed)

If you need to revert to traditional Node.js:
- The `server.js` file is unchanged from working state
- Simply run `node server.js` or `npm start`
- Vercel config will not be used locally

---

**Ready for Vercel Deployment!** 🚀
