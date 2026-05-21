# Deploy School of Dandori to Google Cloud Run (Console Guide)

## Complete Step-by-Step Guide via Web Console

This guide incorporates best practices for deploying your Docker containers to Cloud Run using the Google Cloud Console interface.

---

## Prerequisites

- Google Cloud account (free tier includes $300 credit)
- GitHub repository with your code
- OpenAI API key and endpoint

---

## Part 1: Initial Setup (One-Time)

### Step 1: Create a Project

**From your current screen (console.cloud.google.com):**

1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"NEW PROJECT"** (top right of popup)
3. Enter project details:
   - **Project name:** `school-of-dandori`
   - **Organization:** Leave as "No organization" (unless you have one)
4. Click **"CREATE"**
5. Wait for project creation (30 seconds)
6. Select your new project from the dropdown

### Step 2: Enable Required APIs

1. In the search bar at top, type: **"Cloud Run"**
2. Click **"Cloud Run API"**
3. Click **"ENABLE"** (if not already enabled)
4. Repeat for these APIs:  SEARCH FOR API LIBRARY!!!
   - **"Cloud Build API"** (for building from source) ADMIN!!!
   - **"Artifact Registry API"** (for storing images)
   - **"Secret Manager API"** (for secure API keys)

### Step 3: Set Up Secret Manager (Secure API Keys)

**Why:** Keeps your API keys secure and out of logs.

1. Search for **"Secret Manager"** in the top search bar
2. Click **"Secret Manager"**
3. Click **"+ CREATE SECRET"**
4. Configure:
   - **Name:** `openai-api-key`
   - **Secret value:** Paste your OpenAI API key
   - Leave other settings as default
5. Click **"CREATE SECRET"**
6. Repeat for endpoint:
   - **Name:** `openai-endpoint`
   - **Secret value:** Your OpenAI endpoint URL
   - Click **"CREATE SECRET"**

### Step 4: Create Cloud Storage Bucket (For ChromaDB Persistence)

1. Search for **"Cloud Storage"** in the top search bar
2. Click **"Cloud Storage" > "Buckets"**
3. Click **"+ CREATE"**
4. Configure:
   - **Name:** `dandori-chroma-data` (must be globally unique, add random numbers if taken)
   - **Location type:** Region
   - **Region:** `europe-west2` (London)
   - **Storage class:** Standard
   - **Access control:** Uniform
   - **Protection tools:** None (for now)
5. Click **"CREATE"**

### Step 5: Set Up IAM Permissions

**Why:** Allows Cloud Run to access your bucket and secrets.

1. Search for **"IAM"** in the top search bar
2. Click **"IAM & Admin" > "IAM"**
3. Find the **"Default compute service account"**
   - Looks like: `[PROJECT-NUMBER]-compute@developer.gserviceaccount.com`
4. Click the **pencil icon** (Edit) next to it
5. Click **"+ ADD ANOTHER ROLE"**
6. Add these roles:
   - **Storage Object Admin** (for bucket access)
   - **Secret Manager Secret Accessor** (for reading secrets)
7. Click **"SAVE"**

---

## Part 2: Deploy Backend Service

### Step 6: Deploy Backend from GitHub

1. Search for **"Cloud Run"** in the top search bar
2. Click **"Cloud Run"**
3. Click **"+ CREATE SERVICE"**
4. Select **"Continuously deploy from a repository (source or function)"**
5. Click **"SET UP WITH CLOUD BUILD"**

#### Connect GitHub Repository

6. Click **"AUTHENTICATE"** next to GitHub
7. Sign in to GitHub and authorize Google Cloud
8. Select your repository: `school-of-dandori` (or your repo name)
9. Click **"NEXT"**

#### Configure Build

10. **Build Configuration:**
    - **Branch:** `^main$` (regex pattern)
    - **Build Type:** Dockerfile
    - **Source location:** `/backend/Dockerfile`
    - **Build context directory:** `/` (IMPORTANT: root, not /backend)
11. Click **"SAVE"**

#### Configure Service Settings

12. **Service name:** `dandori-backend`
13. **Region:** `europe-west2` (London)
14. **CPU allocation:** CPU is always allocated
15. **Authentication:** ✅ Allow unauthenticated invocations
16. **Container(s), Volumes, Networking, Security:**

##### Container Tab:
- **Container port:** `3001` (CRITICAL: must match your app.py port)
- **Memory:** `2 GiB`
- **CPU:** `2`
- **Request timeout:** `300` seconds (for first-time embedding generation)
- **Maximum requests per container:** `80`

##### Variables & Secrets Tab:
Click **"+ ADD VARIABLE"** then switch to **"REFERENCE A SECRET"**:

**Secret 1:**
- **Name:** `API_KEY`
- **Secret:** `openai-api-key`
- **Version:** `latest`

**Secret 2:**
- **Name:** `ENDPOINT`
- **Secret:** `openai-endpoint`
- **Version:** `latest`

##### Volumes Tab:
Click **"+ ADD VOLUME"**:
- **Volume type:** Cloud Storage bucket
- **Name:** `chroma-data`
- **Bucket:** `dandori-chroma-data` (select your bucket)
- **Mount path:** `/app/chroma_db`
- **Read only:** ❌ Unchecked

##### Capacity Tab (Autoscaling):
- **Minimum instances:** `0` (scales to zero = free when not used)
- **Maximum instances:** `2` (prevents runaway costs)

17. Click **"CREATE"**

#### Wait for Deployment

- Build takes 2-5 minutes
- You'll see a URL like: `https://dandori-backend-xxxxx-ew.a.run.app`
- **COPY THIS URL** - you'll need it for the frontend

---

## Part 3: Update Frontend Code

### Step 7: Update Backend URL in Frontend

**IMPORTANT:** Before deploying frontend, update it to use the backend URL.

You need to update these files locally:

#### File 1: `src/components/ChatWidget.tsx`

Find the fetch call (around line 50-60) and change:
```typescript
// FROM:
fetch('http://localhost:3001/chat', {

// TO:
fetch('https://dandori-backend-xxxxx-ew.a.run.app/chat', {
```

#### File 2: `src/utils/csvParser.ts`

Find the fetch call and change:
```typescript
// FROM:
const response = await fetch('http://localhost:3001/courses');

// TO:
const response = await fetch('https://dandori-backend-xxxxx-ew.a.run.app/courses');
```

**Commit and push these changes to GitHub:**
```powershell
git add .
git commit -m "Update backend URL for Cloud Run deployment"
git push origin main
```

---

## Part 4: Deploy Frontend Service

### Step 8: Deploy Frontend from GitHub

1. Go back to **Cloud Run** in the console
2. Click **"+ CREATE SERVICE"** again
3. Select **"Continuously deploy from a repository"**
4. Click **"SET UP WITH CLOUD BUILD"**

#### Connect Repository (if not already connected)

5. Select your repository: `school-of-dandori`
6. Click **"NEXT"**

#### Configure Build

7. **Build Configuration:**
   - **Branch:** `^main$`
   - **Build Type:** Dockerfile
   - **Source location:** `/Dockerfile` (root Dockerfile)
   - **Build context directory:** `/`
8. Click **"SAVE"**

#### Configure Service Settings

9. **Service name:** `dandori-frontend`
10. **Region:** `europe-west2`
11. **Authentication:** ✅ Allow unauthenticated invocations

##### Container Tab:
- **Container port:** `3000` (CRITICAL: must match serve port)
- **Memory:** `512 MiB` (frontend needs less)
- **CPU:** `1`
- **Request timeout:** `60` seconds

##### Capacity Tab:
- **Minimum instances:** `0`
- **Maximum instances:** `2`

12. Click **"CREATE"**

#### Wait for Deployment

- Build takes 2-5 minutes
- You'll see a URL like: `https://dandori-frontend-xxxxx-ew.a.run.app`
- **This is your live website!**

---

## Part 5: Testing & Verification

### Step 9: Test Your Deployment

1. Click the **frontend URL** from Cloud Run
2. Your School of Dandori site should load
3. Test the chatbot:
   - Click the chat widget
   - Ask: "What courses do you offer?"
   - **First query takes 30-60 seconds** (generating embeddings)
   - Subsequent queries are instant (cached in Cloud Storage)

### Step 10: Monitor Logs

**Backend Logs:**
1. Go to **Cloud Run** > **dandori-backend**
2. Click **"LOGS"** tab
3. Watch for:
   - ✅ "Running on http://0.0.0.0:3001"
   - ✅ "ChromaDB initialized"
   - ❌ Any errors

**Frontend Logs:**
1. Go to **Cloud Run** > **dandori-frontend**
2. Click **"LOGS"** tab
3. Watch for:
   - ✅ "Serving on port 3000"
   - ❌ Any CORS errors

---

## Part 6: Troubleshooting Common Issues

### Issue 1: "Container failed to start"

**Cause:** Port mismatch

**Fix:**
1. Check your `backend/app.py` - ensure it uses port 3001:
   ```python
   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=3001)
   ```
2. In Cloud Run service settings, verify **Container port** is `3001`

### Issue 2: "Permission denied" for ChromaDB

**Cause:** Service account lacks bucket permissions

**Fix:**
1. Go to **IAM & Admin** > **IAM**
2. Find compute service account
3. Add **Storage Object Admin** role

### Issue 3: "Secret not found"

**Cause:** Service account can't access secrets

**Fix:**
1. Go to **IAM & Admin** > **IAM**
2. Add **Secret Manager Secret Accessor** role to compute service account

### Issue 4: Frontend can't reach backend (CORS errors)

**Cause:** CORS not configured in backend

**Fix:** Check `backend/app.py` has:
```python
from flask_cors import CORS
CORS(app)
```

### Issue 5: "Cold start" takes too long

**Cause:** Service scaled to zero

**Fix (costs money):**
1. Edit service
2. Set **Minimum instances** to `1`
3. This keeps one instance always running (~$10-20/month)

---

## Part 7: Cost Optimization

### Free Tier Limits (Monthly)

- **Requests:** 2 million
- **Memory:** 360,000 GB-seconds
- **CPU:** 180,000 vCPU-seconds
- **Network:** 1 GB egress to North America

### Staying in Free Tier

✅ **Min instances = 0** (scales to zero when not used)
✅ **Use smaller memory** (512 MiB for frontend, 2 GiB for backend)
✅ **Set max instances = 2** (prevents runaway costs)
✅ **Use Cloud Storage** (first 5 GB free)

### Estimated Costs (Beyond Free Tier)

**Low traffic (100 requests/day):**
- Backend: ~$0.50/month
- Frontend: ~$0.20/month
- Storage: ~$0.02/month
- **Total: ~$0.72/month**

**Medium traffic (1000 requests/day):**
- Backend: ~$5/month
- Frontend: ~$2/month
- Storage: ~$0.10/month
- **Total: ~$7.10/month**

---

## Part 8: Automatic Deployments (Already Set Up!)

Since you used "Continuously deploy from repository", every time you push to GitHub:

1. Cloud Build automatically triggers
2. Builds new Docker image
3. Deploys to Cloud Run
4. Zero downtime (gradual traffic shift)

**View build history:**
1. Search for **"Cloud Build"**
2. Click **"Cloud Build" > "History"**
3. See all builds and their status

---

## Part 9: Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Cloud Run** > **dandori-frontend**
2. Click **"MANAGE CUSTOM DOMAINS"** tab
3. Click **"ADD MAPPING"**
4. Enter your domain: `www.schoolofdandori.com`
5. Follow DNS verification steps
6. Add DNS records to your domain registrar
7. Wait for SSL certificate (automatic, takes 15 minutes)

---

## Part 10: Monitoring & Alerts

### Set Up Alerts

1. Search for **"Monitoring"**
2. Click **"Monitoring" > "Alerting"**
3. Click **"+ CREATE POLICY"**
4. Configure alerts for:
   - High error rate (>5%)
   - High latency (>2 seconds)
   - High cost (>$10/day)

### View Metrics

1. Go to **Cloud Run** > **dandori-backend**
2. Click **"METRICS"** tab
3. View:
   - Request count
   - Request latency
   - Container CPU/Memory usage
   - Error rate

---

## Quick Reference: Where to Find Things

| Task | Location in Console |
|------|---------------------|
| View services | Cloud Run |
| View logs | Cloud Run > [service] > Logs |
| View metrics | Cloud Run > [service] > Metrics |
| Update env vars | Cloud Run > [service] > Edit & Deploy New Revision |
| View builds | Cloud Build > History |
| Manage secrets | Secret Manager |
| View storage | Cloud Storage > Buckets |
| Set permissions | IAM & Admin > IAM |
| View costs | Billing > Reports |
| Set up alerts | Monitoring > Alerting |

---

## Summary: What You've Deployed

✅ **Backend Service:**
- Python Flask app with ChromaDB
- OpenAI embeddings for RAG
- Persistent storage via Cloud Storage bucket
- Auto-scales 0-2 instances
- Secure API keys via Secret Manager

✅ **Frontend Service:**
- React + Vite app
- Served via Node.js
- Auto-scales 0-2 instances
- Connected to backend API

✅ **Automatic Deployments:**
- Push to GitHub → Auto-build → Auto-deploy
- Zero downtime deployments
- Build history tracking

✅ **Security:**
- HTTPS by default
- Secrets in Secret Manager
- IAM-controlled access
- Isolated containers

✅ **Cost Optimized:**
- Scales to zero when not used
- Generous free tier
- Max instance limits prevent runaway costs

---

## Next Steps

1. ✅ Test your live site
2. ✅ Monitor logs for first few days
3. ⏭️ Set up custom domain (optional)
4. ⏭️ Configure monitoring alerts
5. ⏭️ Add more courses to CSV
6. ⏭️ Share your site!

---

## Support Resources

- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Pricing Calculator:** https://cloud.google.com/products/calculator
- **Community Support:** https://stackoverflow.com/questions/tagged/google-cloud-run
- **Status Dashboard:** https://status.cloud.google.com

---

## Congratulations! 🎉

Your School of Dandori is now live on Google Cloud Run with:
- Professional infrastructure
- Automatic scaling
- Secure secrets management
- Persistent data storage
- Automatic deployments from GitHub

**Your live URLs:**
- Backend: `https://dandori-backend-xxxxx-ew.a.run.app`
- Frontend: `https://dandori-frontend-xxxxx-ew.a.run.app`

Share your site and watch it scale automatically as users discover it!
