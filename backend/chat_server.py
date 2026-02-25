import sys
import json
import os
from openai import OpenAI
from dotenv import load_dotenv
from dandori_vectors import DandoriRAG

load_dotenv()

print("Initialising RAG system...", flush=True)
rag = DandoriRAG()
print("RAG_READY", flush=True)

for line in sys.stdin:
    try:
        data = json.loads(line.strip())
        message = data.get('message', '')
        
        result = {"response": rag.query(message)}
        print(json.dumps(result), flush=True)
        
    except Exception as e:
        error_result = {"error": str(e)}
        print(json.dumps(error_result), flush=True)
