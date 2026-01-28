# Pastebin Lite - Refactored for Vercel Serverless

Your Express.js + MongoDB pastebin application is now optimized for Vercel serverless deployment!

## 🎯 What Changed

Your application has been refactored to work seamlessly on Vercel serverless functions while maintaining 100% compatibility with local development.

### Key Changes:

1. **Created `/api/index.js`** - Serverless entry point
   - Clean Express app export (no startup logic)
   - Lazy MongoDB connection on first request
   - All routes preserved exactly as-is

2. **Created `/lib/db.js`** - MongoDB connection helper
   - Singleton pattern for connection pooling
   - Global caching prevents reconnects
   - Optimized settings: `bufferCommands: false`, `serverSelectionTimeoutMS: 10000`
   - Eliminates MongoDB timeout errors

3. **Updated `server.js`** - Local development only
   - Maintains traditional Node.js startup behavior
   - Full dotenv support for local `.env` files
   - Graceful shutdown handling
   - Works exactly like before with `npm start`

4. **Created `vercel.json`** - Vercel configuration
   - Routes all traffic to serverless function
   - Builds with Node.js runtime

## 🚀 Deployment

### Local Development (unchanged)
```bash
npm install
npm start
# Visit http://localhost:3000
```

### Deploy to Vercel

**Option 1: Via Vercel Dashboard (Easiest)**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Add environment variable:
   - Key: `MONGO_URI`
   - Value: Your MongoDB connection string
5. Click "Deploy"

**Option 2: Via CLI**
```bash
npm install -g vercel
vercel --prod
```

## 📊 Architecture

```
Local Development:
  npm start → server.js → Express app → MongoDB (direct)

Vercel Serverless:
  HTTPS Request → vercel.json routes → api/index.js → Express app → MongoDB (cached)
```

## 🔧 Environment Variables

### Local (.env.local or .env)
```
MONGO_URI=mongodb://localhost:27017/pastebin-lite
TEST_MODE=1
PORT=3000
```

### Vercel Dashboard Settings
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/pastebin-lite
NODE_ENV=production
```

## ✅ Features Preserved

- ✅ All routes working exactly the same
- ✅ All MongoDB models unchanged
- ✅ TTL (Time To Live) expiry
- ✅ View count limits
- ✅ EJS template rendering
- ✅ Error handling
- ✅ Static file serving
- ✅ API endpoints

## 🔍 File Structure

```
pastebins/
├── api/                      ← NEW: Vercel serverless
│   └── index.js             ← Entry point for Vercel
├── lib/                      ← NEW: Utilities
│   └── db.js                ← MongoDB connection helper
├── routes/                   ← Unchanged
├── models/                   ← Unchanged
├── views/                    ← Unchanged
├── utils/                    ← Unchanged
├── server.js                ← Updated: Local dev only
├── package.json             ← Updated: Added vercel-dev script
├── vercel.json              ← NEW: Vercel config
├── VERCEL_DEPLOYMENT.md     ← Deployment guide
├── MIGRATION.md             ← Technical migration details
└── DEPLOYMENT_CHECKLIST.md  ← Pre-deployment checklist
```

## 📚 Documentation

- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete deployment guide
- **[MIGRATION.md](./MIGRATION.md)** - Technical migration details
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

## 🧪 Testing

### Before Deployment
```bash
# 1. Install dependencies
npm install

# 2. Start local server
npm start

# 3. Test endpoints
# - GET http://localhost:3000/ → Homepage
# - POST http://localhost:3000/create → Create paste
# - GET http://localhost:3000/p/{id} → View paste
```

### After Deployment
```bash
# Replace with your Vercel URL
# - GET https://your-app.vercel.app/
# - POST https://your-app.vercel.app/create
# - GET https://your-app.vercel.app/p/{id}
```

## ⚠️ MongoDB Atlas Setup (Important)

If using MongoDB Atlas cloud:

1. Go to MongoDB Atlas dashboard
2. Navigate to Network Access
3. Add Vercel IP range or "Allow from Anywhere" (less secure)
4. Ensure IP whitelist is configured correctly

## 🐛 Troubleshooting

### MongoDB Connection Timeout
- Check `MONGO_URI` in Vercel dashboard
- Verify MongoDB Atlas allows Vercel IPs
- Check MongoDB cluster is running

### Routes Return 500 Error
- Check Vercel function logs (Deployments tab)
- Verify views/ directory has EJS templates
- Check database connectivity

### App Won't Start Locally
- Ensure MongoDB is running: `mongod`
- Check `.env` or `.env.local` has `MONGO_URI`
- Run `npm install` to install dependencies

## 📝 Next Steps

1. **Review** the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. **Test locally** with `npm start`
3. **Push to GitHub** when ready
4. **Connect to Vercel** and deploy
5. **Monitor logs** in Vercel dashboard

## 🎉 You're Ready!

Your application is now serverless-ready and can scale infinitely on Vercel!

---

**Questions?** Check the documentation files included in this project.
