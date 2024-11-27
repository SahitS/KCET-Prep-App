from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient

app = Flask(__name__)
CORS(app) 

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['kcetprep']
users_collection = db['users'] 

# Load question datasets
math_questions = pd.read_csv("C:/Users/sahits/Downloads/Math_KCET_Questions_Standardized.csv")
chemistry_questions = pd.read_csv("C:/Users/sahits/Downloads/Chemistry_KCET_Questions_Standardized.csv")
physics_questions = pd.read_csv("C:/Users/sahits/Downloads/Physics_KCET_Questions_Standardized.csv")

@app.route('/')
def index():
    return "Hey Flask, the server is running!"

# Generate a quiz by sampling random questions from each subject
@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    try:
        token = request.headers.get('Authorization')
        print("Received Token:", token)  # Log the token for verification

        if not token:
            return jsonify({"error": "Authorization token is required"}), 401

        # Validate the token in the database
        user = users_collection.find_one({"token": token})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Sample 30 random questions from each subject
        math_sample = math_questions.sample(30).reset_index(drop=True).to_dict(orient='records')
        chemistry_sample = chemistry_questions.sample(30).reset_index(drop=True).to_dict(orient='records')
        physics_sample = physics_questions.sample(30).reset_index(drop=True).to_dict(orient='records')

        # Add `questionIndex` to each question
        for idx, question in enumerate(math_sample):
            question["questionIndex"] = idx
        for idx, question in enumerate(chemistry_sample):
            question["questionIndex"] = idx
        for idx, question in enumerate(physics_sample):
            question["questionIndex"] = idx

        # Combine the sampled questions into a single quiz
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
    
# Endpoint to get topics and subtopics for the selected subject
@app.route('/get_topics', methods=['GET'])
def get_topics():
    try:
        subject = request.args.get('subject')
        if not subject:
            return jsonify({"error": "Subject is required"}), 400

        # Select the dataset based on the subject
        if subject.lower() == 'mathematics':
            data = math_questions
        elif subject.lower() == 'chemistry':
            data = chemistry_questions
        elif subject.lower() == 'physics':
            data = physics_questions
        else:
            return jsonify({"error": "Invalid subject"}), 400

        # Get unique topics
        topics = data['Topic'].unique().tolist()

        # Get unique subtopics for each topic
        subtopics = {topic: data[data['Topic'] == topic]['Subtopic'].unique().tolist() for topic in topics}

        print("Topics and Subtopics to return:", {"topics": topics, "subtopics": subtopics})

        return jsonify({"topics": topics, "subtopics": subtopics}), 200
    except Exception as e:
        print("Error occurred:", e)
        return jsonify({"error": str(e)}), 500

#endpoint to generate custom practice questions
@app.route('/generate_custom_practice', methods=['POST'])
def generate_custom_practice():
    try:
        # Get the JSON data from the request body
        data = request.json

        # Retrieve the token from the 'Authorization' header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token is required"}), 401

        # Validate the token in the database
        user = users_collection.find_one({"token": token})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get selected topics and subtopics from the request data
        selected_topics = data.get('topics', [])
        selected_subtopics = data.get('subtopics', {})

        if not selected_topics:
            return jsonify({"error": "Topics are required"}), 400

        # Initialize the list for storing the selected questions
        questions = []

        # Loop through the subjects (math, chemistry, physics) and their respective dataframes
        for subject, df in zip(['math', 'chemistry', 'physics'],
                               [math_questions, chemistry_questions, physics_questions]):
            for topic in selected_topics:
                if topic in df['Topic'].values:
                    # If subtopics are selected, filter by selected subtopics
                    if topic in selected_subtopics and selected_subtopics[topic]:
                        filtered_questions = df[
                            (df['Topic'] == topic) & (df['Subtopic'].isin(selected_subtopics[topic]))
                        ]
                    else:
                        # If no subtopics are selected, include all questions under the topic
                        filtered_questions = df[df['Topic'] == topic]
                    
                    # Add the filtered questions to the questions list
                    questions.extend(filtered_questions.to_dict(orient='records'))

        # Before saving the new questions, reinitialize the `custom_practice` array
        users_collection.update_one({"token": token}, {"$set": {"custom_practice": []}})  # Clear the previous data

        # Store the new custom practice data in the database
        users_collection.update_one({"token": token}, {"$set": {"custom_practice": questions}})

        return jsonify({"message": "Custom practice questions stored successfully"}), 200

    except Exception as e:
        # Return an error response in case of an exception
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
