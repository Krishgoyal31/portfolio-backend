from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import uuid # For generating unique IDs
from datetime import datetime

app = Flask(__name__) # Removed static_folder as frontend is served separately (e.g., via Live Server)
CORS(app) # Enable CORS for all routes

DATA_FILE = 'backend/data.json'

# Helper to load/save data
def load_data():
    if not os.path.exists(DATA_FILE):
        return {"projects": [], "notifications": []}
    with open(DATA_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            print(f"Warning: {DATA_FILE} is empty or malformed. Initializing with default data.")
            return {"projects": [], "notifications": []}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# Initial data if file doesn't exist or is empty
if not os.path.exists(DATA_FILE) or os.stat(DATA_FILE).st_size == 0:
    initial_data = {
        "projects": [
            {
                "id": str(uuid.uuid4()),
                "title": "AI-Powered Chatbot",
                "description": "A smart conversational agent built with Python and a custom NLP model, integrated with a web interface.",
                "image": "assets/images/project1.webp",
                "liveDemo": "https://demo.krishgoyal.com/ai-chatbot",
                "code": "https://github.com/krishgoyal/ai-chatbot"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "E-commerce Backend API",
                "description": "Robust RESTful API for an e-commerce platform using Django REST Framework, with authentication and product management.",
                "image": "assets/images/project2.webp",
                "liveDemo": "https://demo.krishgoyal.com/ecommerce-api",
                "code": "https://github.com/krishgoyal/ecommerce-api"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Interactive Data Dashboard",
                "description": "A dynamic dashboard visualizing complex datasets using Plotly.js and Flask, enabling interactive data exploration.",
                "image": "assets/images/project3.webp",
                "liveDemo": "https://demo.krishgoyal.com/data-dashboard",
                "code": "https://github.com/krishgoyal/data-dashboard"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Real-time Chat Application",
                "description": "A web-based chat application with real-time messaging using WebSockets and Node.js (or Python's websockets library).",
                "image": "assets/images/project1.webp",
                "liveDemo": "https://demo.krishgoyal.com/chat-app",
                "code": "https://github.com/krishgoyal/chat-app"
            }
        ],
        "notifications": [
            {
                "id": str(uuid.uuid4()),
                "title": "New Project: AI-Powered Portfolio Assistant!",
                "content": "Excited to announce the launch of my latest project: an AI-powered assistant designed to help manage and update portfolios automatically. Check it out!",
                "date": "Jan 15, 2024",
                "iconClass": "fas fa-rocket",
                "accentClass": "text-accent-primary"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Website Refresh: New Animations & Performance Boosts",
                "content": "This portfolio just got a major refresh! Enjoy smoother animations, improved performance, and a more immersive user experience. Details on the blog soon!",
                "date": "Jan 10, 2024",
                "iconClass": "fas fa-magic",
                "accentClass": "text-accent-secondary"
            }
        ]
    }
    # Ensure backend folder exists
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    save_data(initial_data)


# --- Admin Login ---
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Hardcoded credentials for demo purposes - NOT SECURE FOR PRODUCTION
    if username == 'admin' and password == 'password123':
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# --- Projects API ---
@app.route('/api/projects', methods=['GET'])
def get_projects():
    data = load_data()
    return jsonify(data['projects'])

@app.route('/api/projects', methods=['POST'])
def add_project():
    new_project = request.json
    new_project['id'] = str(uuid.uuid4()) # Generate unique ID
    data = load_data()
    data['projects'].append(new_project)
    save_data(data)
    return jsonify(new_project), 201

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    data = load_data()
    initial_len = len(data['projects'])
    data['projects'] = [p for p in data['projects'] if p['id'] != project_id]
    if len(data['projects']) < initial_len:
        save_data(data)
        return jsonify({"message": "Project deleted"}), 200
    return jsonify({"message": "Project not found"}), 404

# --- Notifications API ---
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    data = load_data()
    # Notifications should probably be ordered by date, newest first
    # Assuming date is in 'Month Day, Year' format (e.g., 'Jan 15, 2024') for sorting
    def parse_date(date_str):
        try:
            return datetime.strptime(date_str, '%b %d, %Y')
        except ValueError:
            return datetime.min # Fallback for malformed dates, puts them at the beginning

    sorted_notifications = sorted(data['notifications'], key=lambda x: parse_date(x.get('date', '')), reverse=True)
    return jsonify(sorted_notifications)

@app.route('/api/notifications', methods=['POST'])
def add_notification():
    new_notification = request.json
    new_notification['id'] = str(uuid.uuid4()) # Generate unique ID
    data = load_data()
    data['notifications'].insert(0, new_notification) # Add to beginning for newest first
    save_data(data)
    return jsonify(new_notification), 201

@app.route('/api/notifications/<notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    data = load_data()
    initial_len = len(data['notifications'])
    data['notifications'] = [n for n in data['notifications'] if n['id'] != notification_id]
    if len(data['notifications']) < initial_len:
        save_data(data)
        return jsonify({"message": "Notification deleted"}), 200
    return jsonify({"message": "Notification not found"}), 404

if __name__ == '__main__':
    app.run(debug=True) # debug=True enables auto-reloading and better error messages