FROM python:3.11-slim

WORKDIR /app

# Copy and install requirements
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .
COPY courses.csv ../courses.csv

EXPOSE 3001

CMD ["python", "app.py"]
