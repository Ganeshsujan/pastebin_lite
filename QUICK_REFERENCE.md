# Quick Reference Card - Vercel Deployment

## 📋 What Changed?

### Files Created (3)
```
✅ api/index.js       → Vercel serverless entry point
✅ lib/db.js          → MongoDB connection helper
✅ vercel.json        → Vercel configuration
```

### Files Modified (1)
```
✅ server.js          → Now local-only development server
```

---

## 🚀 Deploy in 5 Steps

### Step 1: Test Locally
```bash
npm install
npm start
# Visit http://localhost:3000
```

### Step 2: Commit Changes
```bash
git add .
git commit -m "Refactor for Vercel serverless"
git push origin main
```

### Step 3: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repo
4. Click "Import"

### Step 4: Add Environment Variable
In **Settings → Environment Variables**:
```
MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/pastebin-lite
```

### Step 5: Deploy
Click the **"Deploy"** button and wait!

---

## 🔑 Key Points

| Aspect | Local | Vercel |
|--------|-------|--------|
| **Server** | `server.js` | `api/index.js` |
| **Startup** | `app.listen()` | Vercel handles |
| **MongoDB** | Direct connection | Lazy + cached |
| **Env Vars** | `.env` file | Dashboard |
| **Command** | `npm start` | Auto-deployed |

---

## ✅ Verification

Make sure these files exist:
```bash
✅ api/index.js       (48 lines)
✅ lib/db.js          (36 lines)
✅ vercel.json        (14 lines)
```

---

## 📚 Documentation

Read in this order:
1. **DEPLOYMENT_CHECKLIST.md** - Before deploying
2. **VERCEL_DEPLOYMENT.md** - How it works
3. **MIGRATION.md** - Technical details
4. **STATUS_REPORT.md** - What changed

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Local won't start | `npm install` then `npm start` |
| Routes return 500 | Check MongoDB URI in Vercel dashboard |
| Connection timeout | Ensure MongoDB Atlas allows Vercel IPs |
| App won't deploy | Check `vercel.json` and `api/index.js` exist |

---

## 🎯 Success Indicators

After deployment, verify:
```
✅ Home page loads: https://your-app.vercel.app/
✅ Create paste works: POST /create
✅ View paste works: GET /p/{id}
✅ Copy link works: Copies full URL
✅ TTL countdown works: Timer updates
✅ No MongoDB errors: Check Vercel logs
```

---

## 💡 MongoDB Atlas Setup (If Needed)

1. Go to MongoDB Atlas dashboard
2. Network Access → IP Whitelist
3. Add Vercel IP range or "Allow from Anywhere"
4. Ensure connection string in Vercel env vars

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Node Docs](https://vercel.com/docs/functions/runtimes/node-js)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## ✨ What's Preserved

All your code works exactly the same:
- ✅ Routes
- ✅ Models
- ✅ Business logic
- ✅ TTL expiry
- ✅ View limits
- ✅ Error handling

---

**Status: Ready to Deploy! 🚀**
