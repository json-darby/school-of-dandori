import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/** Configures Cross-Origin Resource Sharing (CORS) headers. */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

/** Spawns and manages the persistent Python RAG process. */
let pythonProcess = null;
let isInitialised = false;

function startPythonProcess() {
  console.log('Starting Python RAG process...');
  pythonProcess = spawn('py', ['-u', path.join(__dirname, 'chat_server.py')]);
  
  pythonProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Python:', output);
    if (output.includes('RAG_READY')) {
      isInitialised = true;
      console.log('RAG system ready!');
    }
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
  });
  
  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    isInitialised = false;
  });
}

startPythonProcess();

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!isInitialised) {
    return res.status(503).json({ error: 'RAG system is still initialising, please wait...' });
  }

  /** Writes the incoming chat message to the Python process standard input. */
  pythonProcess.stdin.write(JSON.stringify({ message }) + '\n');
  
  /** Listens for responses from the Python process. */
  const responseHandler = (data) => {
    try {
      const result = JSON.parse(data.toString());
      pythonProcess.stdout.removeListener('data', responseHandler);
      res.json(result);
    } catch (e) {
      /** Ignores non-JSON outputs as they might be status updates. */
    }
  };
  
  pythonProcess.stdout.on('data', responseHandler);
  
  /** Triggers a gateway timeout if no response is received within 30 seconds. */
  setTimeout(() => {
    pythonProcess.stdout.removeListener('data', responseHandler);
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timeout' });
    }
  }, 30000);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
