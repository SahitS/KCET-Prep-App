from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import random
from pymongo import MongoClient

app = Flask(__name__)
CORS(app) 

client = MongoClient('mongodb://localhost:27017/')
db = client['kcetprep']
users_collection = db['users'] 

math_questions = pd.read_csv("C:/Users/sahits/Downloads/Math_KCET_Questions_Standardized.csv")
chemistry_questions = pd.read_csv("C:/Users/sahits/Downloads/Chemistry_KCET_Questions_Standardized.csv")
physics_questions = pd.read_csv("C:/Users/sahits/Downloads/Physics_KCET_Questions_Standardized.csv")

@app.route('/')
def index():
    return "Hey Flask, the server is running!"

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    try:
        # Retrieve the token from the 'Authorization' header
        token = request.headers.get('Authorization')
        print("Received Token:", token)  # Log the token for verification

        if not token:
            return jsonify({"error": "Authorization token is required"}), 401

        # Validate the token in the database
        user = users_collection.find_one({"token": token})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Proceed with quiz generation...
        math_sample = math_questions.sample(30).to_dict(orient='records')
        chemistry_sample = chemistry_questions.sample(30).to_dict(orient='records')
        physics_sample = physics_questions.sample(30).to_dict(orient='records')

        quiz = {"math": math_sample, "chemistry": chemistry_sample, "physics": physics_sample}

        # Store the quiz in MongoDB
        users_collection.update_one({"token": token}, {"$set": {"quiz": quiz}})

        return jsonify({"message": "Quiz generated successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/get_quiz', methods=['GET'])
def get_quiz():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token is required"}), 401

        user = users_collection.find_one({"token": token}, {"quiz": 1, "_id": 0})
        if not user or "quiz" not in user:
            return jsonify({"error": "Quiz not found"}), 404

        return jsonify(user["quiz"]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
