"""Flask API for School of Dandori course queries and data."""

from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
from chat import dandori_chat

app = Flask(__name__)
CORS(app)


@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests with RAG system."""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        response = dandori_chat(user_message)
        return jsonify({'response': response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/courses', methods=['GET'])
def get_courses():
    """Serve course data from CSV."""
    try:
        courses = []
        with open('../courses.csv', mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                courses.append(row)
        
        return jsonify(courses)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
