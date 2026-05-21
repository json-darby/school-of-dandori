# Local vs Cloud Backend URLs

## Files That Need URL Changes

When switching between local development and cloud deployment, you need to update these 2 files:

### 1. `src/components/ChatWidget.tsx`

**Line ~50 (in handleSend function):**

**Local Development:**
```typescript
fetch('http://localhost:3001/chat', {
```

**Cloud Deployment:**
```typescript
fetch('https://school-of-dandori-980659832082.europe-west2.run.app/chat', {
```

---

### 2. `src/utils/csvParser.ts`

**Line ~4 (in getCourses function):**

**Local Development:**
```typescript
return fetch('http://localhost:3001/courses')
```

**Cloud Deployment:**
```typescript
return fetch('https://school-of-dandori-980659832082.europe-west2.run.app/courses')
```

---

## Quick Switch Commands

### Switch to Local:
```powershell
# In ChatWidget.tsx, change to:
fetch('http://localhost:3001/chat', {

# In csvParser.ts, change to:
fetch('http://localhost:3001/courses')
```

### Switch to Cloud:
```powershell
# In ChatWidget.tsx, change to:
fetch('https://school-of-dandori-980659832082.europe-west2.run.app/chat', {

# In csvParser.ts, change to:
fetch('https://school-of-dandori-980659832082.europe-west2.run.app/courses')
```

---

## Better Approach: Environment Variables

To avoid manual switching, you can use environment variables:

### Create `.env.local`:
```
VITE_BACKEND_URL=http://localhost:3001
```

### Create `.env.production`:
```
VITE_BACKEND_URL=https://school-of-dandori-980659832082.europe-west2.run.app
```

### Update code to use env var:
```typescript
// ChatWidget.tsx
fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, {

// csvParser.ts
fetch(`${import.meta.env.VITE_BACKEND_URL}/courses`)
```

Then Vite automatically uses the right URL based on dev/production mode!

---

## Current Status

✅ **Currently configured for:** Cloud deployment
✅ **Backend URL:** `https://school-of-dandori-980659832082.europe-west2.run.app`

To test locally, change both files to use `http://localhost:3001`
