"""Provides a high-level chat interface to interact with the Dandori RAG system."""

import sys
import json
from dandori_vectors import DandoriRAG

_rag_instance = None


def get_rag():
    """Retrieves or initialises the singleton RAG database instance."""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = DandoriRAG()
    return _rag_instance


def dandori_chat(message):
    """Processes the incoming user chat message through the vector retrieval-augmented generation system."""
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
