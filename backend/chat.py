"""Chat interface for Dandori RAG system."""

import sys
import json
from dandori_vectors import DandoriRAG

_rag_instance = None


def get_rag():
    """Get or create singleton RAG instance."""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = DandoriRAG()
    return _rag_instance


def dandori_chat(message):
    """Process chat message through RAG system."""
    try:
        rag = get_rag()
        return rag.query(message)
    except Exception as e:
        return f"Error: {str(e)}"


if __name__ == "__main__":
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
        response = dandori_chat(message)
        print(json.dumps({"response": response}))
