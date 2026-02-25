# School of Dandori

A whimsical course discovery platform with AI-powered chat assistance.

## Features

- Browse 200+ unique courses across the UK
- AI chatbot powered by RAG (Retrieval Augmented Generation)
- Interactive course filtering and search
- Beautiful tree stump modal design
- Video overlay with curved edge

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && pip install -r requirements.txt
   ```

2. **Set up environment:**
   Create `.env` file with:
   ```
   API_KEY=your_openai_api_key
   ENDPOINT=your_openai_endpoint
   ```

3. **Run locally:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python app.py

   # Terminal 2 - Frontend
   npm run dev
   ```

   Or use the start script:
   ```bash
   # Windows
   .\scripts\start-local.ps1

   # Linux/Mac
   ./scripts/start-local.sh
   ```

### Docker Deployment

1. **Build and run:**
   ```bash
   docker-compose up --build
   ```

2. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### First Run

On first run, the backend will:
- Load course data from `courses.csv`
- Generate embeddings using OpenAI
- Store vectors in ChromaDB (persisted in `backend/chroma_db/`)

Subsequent runs are much faster as embeddings are cached.

## Project Structure

```
/
├── backend/              # Flask API + RAG system
│   ├── app.py           # Main Flask application
│   ├── chat.py          # Chat interface
│   ├── dandori_vectors.py  # RAG implementation
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile       # Backend container
├── src/                 # React frontend
├── public/              # Static assets
├── docs/                # Documentation
├── scripts/             # Helper scripts
├── courses.csv          # Course data
├── clean_courses.ipynb  # Data cleaning notebook
├── docker-compose.yml   # Container orchestration
└── README.md           # This file
```

## Technology Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- Framer Motion

**Backend:**
- Flask
- ChromaDB (vector database)
- OpenAI API (embeddings + chat)
- Pandas

## Deployment

See `docs/GOOGLE_CLOUD_RUN_DEPLOYMENT.md` for cloud deployment instructions.

## Data Management

Use `clean_courses.ipynb` to clean and process course data:
- Remove semicolons
- Standardise locations
- Clean whitespace

## License

Created for Digital Futures.
