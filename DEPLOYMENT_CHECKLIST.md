# Vercel Deployment Checklist

## Pre-Deployment

- [ ] Run `npm install` to verify dependencies
- [ ] Test locally: `npm start`
- [ ] Verify MongoDB connection works locally
- [ ] All routes respond correctly at `http://localhost:3000`
- [ ] Check that routes work: GET `/`, POST `/create`, GET `/p/{id}`

## Code Readiness

- [ ] `api/index.js` - No `require('dotenv')`, no `app.listen()`, exports app
- [ ] `lib/db.js` - MongoDB singleton with caching created
- [ ] `server.js` - Local-only development server
- [ ] `package.json` - All dependencies listed (no devDependencies for prod)
- [ ] `vercel.json` - Routes configured correctly
- [ ] No console.log spam that will clutter serverless logs

## Git & GitHub

- [ ] Commit changes: `git add .`
- [ ] Commit message: `git commit -m "Refactor for Vercel serverless deployment"`
- [ ] Push to main: `git push origin main`
- [ ] Verify GitHub repo is public or Vercel has access

## Vercel Setup

- [ ] Create account at https://vercel.com
- [ ] Connect GitHub repository
- [ ] Select `main` branch
- [ ] Framework: Node.js (auto-detected)
- [ ] Root directory: `./` (or leave default)

## Environment Variables (Vercel Dashboard)

After connecting repository, go to **Settings → Environment Variables**:

- [ ] Add `MONGO_URI` = `mongodb+srv://...` (your production MongoDB)
- [ ] (Optional) Add `NODE_ENV` = `production`

## First Deployment

- [ ] Click "Deploy" button
- [ ] Wait for build (usually 30-60 seconds)
- [ ] Verify deployment successful (no errors)
- [ ] Get your Vercel URL (e.g., `https://pastebin-lite.vercel.app`)

## Post-Deployment Testing

### Basic Tests
- [ ] GET `https://your-vercel-url.vercel.app/` → Homepage loads
- [ ] POST `/create` with content → Redirects to `/p/{id}`
- [ ] GET `/p/{id}` → Paste displays correctly
- [ ] Test paste expiry countdown
- [ ] Test "Copy Link" button

### Advanced Tests
- [ ] Create paste with TTL → Auto-deletes after TTL
- [ ] Create paste with max_views → Auto-deletes after N views
- [ ] Create paste with both → Both limits work
- [ ] Invalid routes → 404 error page
- [ ] Database errors handled gracefully

## Monitoring

### Logs
- Vercel dashboard → Deployments → Select deployment → Functions tab
- Check for MongoDB connection errors
- Monitor response times

### Issues & Troubleshooting

**MongoDB connection timeout**
- [ ] Check MongoDB Atlas IP whitelist includes Vercel IPs
- [ ] Verify `MONGO_URI` is correct in Vercel dashboard
- [ ] Test MongoDB URI locally in `.env.local`

**Routes returning 500 errors**
- [ ] Check Vercel function logs
- [ ] Verify database connectivity
- [ ] Ensure EJS templates are in `views/` directory

**Static files not loading**
- [ ] Verify `express.static()` points to correct directory
- [ ] Check `public/` folder exists (if needed)

**Environment variable not found**
- [ ] Don't use `require('dotenv')` in `api/index.js`
- [ ] Access via `process.env.VARIABLE_NAME`
- [ ] Restart deployment after updating env vars

## Rollback Plan

If something breaks in production:

1. Vercel automatically keeps previous deployments
2. Go to Deployments tab in Vercel dashboard
3. Click on previous successful deployment
4. Click "Promote to Production"
5. Your app reverts to previous version instantly

## Performance Optimization (Optional)

- [ ] Enable caching headers in routes
- [ ] Compress large responses (middleware)
- [ ] Optimize image sizes
- [ ] Monitor cold starts in Vercel logs

## Documentation

- [ ] Update README.md with deployment instructions
- [ ] Document any custom environment variables needed
- [ ] Add API documentation if applicable
- [ ] Keep VERCEL_DEPLOYMENT.md and MIGRATION.md in repo

---

**Status: Ready for Deployment** ✅

**Last Updated**: 2026-01-28
