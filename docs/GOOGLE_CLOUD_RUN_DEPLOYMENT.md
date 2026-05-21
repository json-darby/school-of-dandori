# Deploying to Google Cloud Run

## What is Cloud Run?

Google Cloud Run is a serverless platform that runs your Docker containers. You only pay when someone uses your app, and it scales automatically from 0 to thousands of users.

## Prerequisites

1. Google Cloud account (free tier includes $300 credit)
2. Docker installed locally
3. Your app already working with Docker

## Step-by-Step Deployment

### 1. Install Google Cloud CLI

**Windows:**
```powershell
# Download from: https://cloud.google.com/sdk/docs/install
# Or use installer
```

**Verify installation:**
```powershell
gcloud --version
```

### 2. Initialize and Login

```powershell
# Login to Google Cloud
gcloud auth login

# Set your project (create one first at console.cloud.google.com)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Configure Docker for Google Cloud

```powershell
gcloud auth configure-docker
```

### 4. Build and Tag Your Images

**Backend:**
```powershell
# Build
docker build -t gcr.io/YOUR_PROJECT_ID/dandori-backend:latest -f backend/Dockerfile .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/dandori-backend:latest
```

**Frontend:**
```powershell
# Build
docker build -t gcr.io/YOUR_PROJECT_ID/dandori-frontend:latest .

# Push
docker push gcr.io/YOUR_PROJECT_ID/dandori-frontend:latest
```

### 5. Deploy Backend to Cloud Run

```powershell
gcloud run deploy dandori-backend \
  --image gcr.io/YOUR_PROJECT_ID/dandori-backend:latest \
  --platform managed \
  --region europe-west2 \
  --allow-unauthenticated \
  --set-env-vars API_KEY=your_api_key,ENDPOINT=your_endpoint \
  --memory 2Gi \
  --cpu 2
```

**This will output a URL like:**
```
https://dandori-backend-xxxxx-ew.a.run.app
```

### 6. Update Frontend to Use Backend URL

Update `src/utils/csvParser.ts` and `src/components/ChatWidget.tsx`:

```typescript
// Change from:
fetch('http://localhost:3001/courses')

// To:
fetch('https://dandori-backend-xxxxx-ew.a.run.app/courses')
```

### 7. Rebuild and Deploy Frontend

```powershell
# Rebuild with new backend URL
docker build -t gcr.io/YOUR_PROJECT_ID/dandori-frontend:latest .

# Push
docker push gcr.io/YOUR_PROJECT_ID/dandori-frontend:latest

# Deploy
gcloud run deploy dandori-frontend \
  --image gcr.io/YOUR_PROJECT_ID/dandori-frontend:latest \
  --platform managed \
  --region europe-west2 \
  --allow-unauthenticated \
  --port 3000
```

**Frontend URL:**
```
https://dandori-frontend-xxxxx-ew.a.run.app
```

### 8. Set Up Custom Domain (Optional)

```powershell
# Map your domain
gcloud run domain-mappings create \
  --service dandori-frontend \
  --domain www.schoolofdandori.com \
  --region europe-west2
```

## Environment Variables

Instead of hardcoding in the deploy command, use a file:

**Create `backend.env.yaml`:**
```yaml
API_KEY: "your_api_key_here"
ENDPOINT: "your_endpoint_here"
```

**Deploy with env file:**
```powershell
gcloud run deploy dandori-backend \
  --image gcr.io/YOUR_PROJECT_ID/dandori-backend:latest \
  --env-vars-file backend.env.yaml \
  --region europe-west2
```

## Persistent Storage for ChromaDB

Cloud Run is stateless, so ChromaDB data is lost on restart. Options:

### Option 1: Google Cloud Storage
Mount a bucket for persistent storage:

```powershell
gcloud run deploy dandori-backend \
  --image gcr.io/YOUR_PROJECT_ID/dandori-backend:latest \
  --add-volume name=chroma-data,type=cloud-storage,bucket=dandori-chroma-bucket \
  --add-volume-mount volume=chroma-data,mount-path=/app/chroma_db
```

### Option 2: Cloud SQL (PostgreSQL)
Use a managed database instead of ChromaDB's local storage.

## Automatic Deployments

### Set up Cloud Build for CI/CD:

**Create `cloudbuild.yaml`:**
```yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/dandori-backend', '-f', 'backend/Dockerfile', '.']
  
  # Push backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/dandori-backend']
  
  # Deploy backend
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'dandori-backend'
      - '--image=gcr.io/$PROJECT_ID/dandori-backend'
      - '--region=europe-west2'
      - '--platform=managed'

  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/dandori-frontend', '.']
  
  # Push frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/dandori-frontend']
  
  # Deploy frontend
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'dandori-frontend'
      - '--image=gcr.io/$PROJECT_ID/dandori-frontend'
      - '--region=europe-west2'
      - '--platform=managed'

images:
  - 'gcr.io/$PROJECT_ID/dandori-backend'
  - 'gcr.io/$PROJECT_ID/dandori-frontend'
```

**Connect to GitHub:**
```powershell
gcloud builds triggers create github \
  --repo-name=school-of-dandori \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

Now every push to `main` branch auto-deploys!

## Monitoring and Logs

**View logs:**
```powershell
gcloud run logs read dandori-backend --region europe-west2
```

**Monitor in console:**
https://console.cloud.google.com/run

## Cost Optimization

**Free tier includes:**
- 2 million requests/month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

**Tips to stay in free tier:**
1. Set min instances to 0 (scales to zero when not used)
2. Use smaller memory allocation (512MB instead of 2GB)
3. Set request timeout to 60s max
4. Use Cloud Storage for static assets

**Set min instances to 0:**
```powershell
gcloud run services update dandori-backend \
  --min-instances 0 \
  --region europe-west2
```

## Troubleshooting

### Container fails to start
```powershell
# Check logs
gcloud run logs read dandori-backend --limit 50

# Common issues:
# - Port not exposed (must be 8080 or set PORT env var)
# - Missing environment variables
# - File permissions
```

### Out of memory
```powershell
# Increase memory
gcloud run services update dandori-backend \
  --memory 4Gi \
  --region europe-west2
```

### Slow cold starts
```powershell
# Keep 1 instance always running (costs more)
gcloud run services update dandori-backend \
  --min-instances 1 \
  --region europe-west2
```

## Security Best Practices

1. **Use Secret Manager for API keys:**
```powershell
# Create secret
echo -n "your_api_key" | gcloud secrets create api-key --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding api-key \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT \
  --role=roles/secretmanager.secretAccessor

# Use in Cloud Run
gcloud run deploy dandori-backend \
  --set-secrets=API_KEY=api-key:latest
```

2. **Enable HTTPS only** (default)

3. **Restrict access with IAM** (if not public)

4. **Use VPC connector** for private resources

## Regions

Choose closest to your users:
- `europe-west2` (London)
- `europe-west1` (Belgium)
- `us-central1` (Iowa)
- `asia-east1` (Taiwan)

## Comparison: Cloud Run vs Others

| Feature | Cloud Run | Render | Railway |
|---------|-----------|--------|---------|
| Ease of Setup | Medium | Easy | Easy |
| Free Tier | Generous | Limited | $5 credit |
| Scales to Zero | Yes | No | No |
| Custom Domains | Yes | Yes | Yes |
| Auto-deploy | Yes | Yes | Yes |
| Cost (low traffic) | Free | $7/mo | $5/mo |
| Cost (high traffic) | Pay per use | Fixed | Pay per use |

## Next Steps

1. Create Google Cloud account
2. Install gcloud CLI
3. Follow steps 1-7 above
4. Test your deployed app
5. Set up custom domain
6. Configure monitoring

## Useful Commands

```powershell
# List all services
gcloud run services list

# Delete a service
gcloud run services delete dandori-backend --region europe-west2

# Update environment variables
gcloud run services update dandori-backend \
  --update-env-vars NEW_VAR=value \
  --region europe-west2

# View service details
gcloud run services describe dandori-backend --region europe-west2

# Set traffic split (for gradual rollouts)
gcloud run services update-traffic dandori-backend \
  --to-revisions=REVISION1=50,REVISION2=50 \
  --region europe-west2
```

## Resources

- Cloud Run Docs: https://cloud.google.com/run/docs
- Pricing Calculator: https://cloud.google.com/products/calculator
- Quickstart Guide: https://cloud.google.com/run/docs/quickstarts
- Best Practices: https://cloud.google.com/run/docs/best-practices

## Summary

Cloud Run is perfect for your app because:
- ✅ Works with your existing Docker setup
- ✅ Scales automatically (0 to 1000s)
- ✅ Only pay for actual usage
- ✅ Generous free tier
- ✅ Easy to deploy and update
- ✅ Built-in HTTPS and monitoring

The main complexity is the initial setup, but once configured, deployments are simple!
