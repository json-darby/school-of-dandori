"""Retrieval-augmented generation (RAG) system utilising Mistral embeddings for School of Dandori course query matching."""

import csv
import os
import time
from typing import List

from mistralai import Mistral
from chromadb import chromadb, Documents, EmbeddingFunction, Embeddings
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("SCHOOL_OF_DANDORI_API_KEY")

chat_client = Mistral(api_key=api_key)


class MistralEmbeddingFunction(EmbeddingFunction):
    """Represents a custom embedding function utilising the Mistral API interface."""
    
    def __init__(self, api_key: str):
        self.client = Mistral(api_key=api_key)
    
    def __call__(self, input: Documents) -> Embeddings:
        """Generates embeddings for the provided documents utilising the Mistral API."""
        embeddings = []
        for text in input:
            success = False
            retries = 0
            while not success and retries < 5:
                try:
                    response = self.client.embeddings.create(
                        model="mistral-embed",
                        inputs=[text]
                    )
                    embeddings.append(response.data[0].embedding)
                    success = True
                    time.sleep(1) # Base delay to avoid hitting limits
                except Exception as e:
                    if "429" in str(e):
                        retries += 1
                        time.sleep(2 ** retries)
                    else:
                        raise e
        return embeddings


class DandoriRAG:
    """Manages the retrieval-augmented generation (RAG) workflow to query course database details."""
    
    def __init__(self):
        embedding_fn = MistralEmbeddingFunction(api_key=api_key)
        
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(
            name="dandori_courses_mistral",
            embedding_function=embedding_fn,
            metadata={
                "hnsw:space": "cosine",
                "hnsw:construction_ef": 400,
                "hnsw:M": 32,
                "hnsw:search_ef": 200
            }  
        )

        self.chunks = []
        self.csv_pathway = '../courses.csv'
        self.top_results = 100

        self.create_chunk()
        self.add_collection()
    
    def create_chunk(self):
        """Loads and partitions course data from the CSV database."""
        with open(self.csv_pathway, mode='r', encoding='utf-8') as file:
            courses_csv = csv.DictReader(file)

            for new_id, course in enumerate(courses_csv, start=1):
                id = course.get("ID", "")
                course_name = course.get("Course Name", "")
                instructor = course.get("Instructor", "")
                course_type = course.get("Course Type", "")
                location = course.get("Location", "")
                cost = course.get("Cost", "")
                learning_objectives = course.get("Learning Objectives", "")
                provided_materials = course.get("Provided Materials", "")
                skills_developed = course.get("Skills Developed", "")
                description = course.get("Description", "")

                text = (
                    f"id = {id}\n"
                    f"course_name = {course_name}\n"
                    f"instructor = {instructor}\n"
                    f"course_type = {course_type}\n"
                    f"location = {location}\n"
                    f"cost = {cost}\n"
                    f"learning_objectives = {learning_objectives}\n"
                    f"provided_materials = {provided_materials}\n"
                    f"skills_developed = {skills_developed}\n"
                    f"description = {description}\n"
                )

                chunk = {
                    "id": f"SoD_{id}_{course_name.replace(' ', '_').lower()}",
                    "text": text,
                    "metadata": {
                        "course_name": course_name,
                        "instructor": instructor,
                        "course_type": course_type,
                        "location": location,
                        "cost": cost
                    }
                }

                self.chunks.append(chunk)

    def add_collection(self):
        """Appends the course chunks to the ChromaDB database collection."""
        if self.collection.count() == 0:
            self.collection.add(
                ids=[i.get("id") for i in self.chunks],
                documents=[i.get("text") for i in self.chunks],
                metadatas=[i.get("metadata") for i in self.chunks]
            )
    
    def get_dynamic_facts(self):
        """Generates high-level statistical overviews from course data."""
        locations = {}
        course_types = {}
        prices = []
        instructors = set()

        for chunk in self.chunks:
            meta = chunk['metadata']

            loc = meta.get('location', 'Unknown')
            locations[loc] = locations.get(loc, 0) + 1

            ctype = meta.get('course_type', 'Unknown')
            course_types[ctype] = course_types.get(ctype, 0) + 1

            cost = meta.get('cost', '£0')
            try:
                price = float(cost.replace('£', '').replace(',', ''))
                prices.append(price)
            except:
                pass

            instructors.add(meta.get('instructor', 'Unknown'))

        price_range = f"£{min(prices):.2f} - £{max(prices):.2f}" if prices else "N/A"

        location_breakdown = "\n".join([f"  - {loc}: {count} courses" for loc, count in sorted(locations.items())])
        type_breakdown = "\n".join([f"  - {ctype}: {count} courses" for ctype, count in sorted(course_types.items())])

        overview = f"""SCHOOL OVERVIEW:
        - Total Courses: {len(self.chunks)}
        - Locations: {', '.join(sorted(locations.keys()))}
        - Course Types: {', '.join(sorted(course_types.keys()))}
        - Price Range: {price_range}
        - Instructors: {len(instructors)} unique instructors

    LOCATION BREAKDOWN:
    {location_breakdown}

    COURSE TYPE BREAKDOWN:
    {type_breakdown}"""

        return overview

    def query(self, message):
        """Queries the retrieval-augmented database system using the provided user message."""
        rag_db_results = self.collection.query(
            query_texts=[message],
            n_results=self.top_results 
        )
        
        rag_embedding = "\n---\n".join(rag_db_results['documents'][0])
        
        system_persona = (
            "You are a friendly School of Dandori assistant. "
            "Provide clear, accurate information using ONLY the provided course data. "
            "Format responses with simple numbered lists (1. Item) or dashes (- Item). "
            "Use bold (**text**) for course names only. "
            "Do NOT use asterisks for emphasis or formatting except for bold. "
            "Keep responses concise and well-structured. "
            "Use emojis sparingly (max 1-2 per response)."
        )

        user_prompt = f"""
        {self.get_dynamic_facts()}

        RELEVANT COURSES (based on your query):
        {rag_embedding}

        USER QUESTION:
        {message}
        """

        time.sleep(1)  # Delay to avoid Mistral API rate limits after the embedding query.
        response = chat_client.chat.complete(
            model="mistral-large-latest",
            messages=[
                {"role": "system", "content": system_persona},
                {"role": "user", "content": user_prompt}
            ]
        )
        
        return response.choices[0].message.content
