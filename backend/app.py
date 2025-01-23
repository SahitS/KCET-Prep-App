from datetime import datetime as dt, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
import google.generativeai as genai 
import json
import os
import random
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import numpy as np


app = Flask(__name__)
CORS(app) 

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['kcetprep']
users_collection = db['users'] 

# Load and configure the API key
API_KEY = "AIzaSyCKMBhgSf5XaxZ9hBOsr5GM41kEZm3PmLU"  # Replace with your API key
if not API_KEY:
    raise ValueError("Gemini API key is not set. Please check your configuration.")

genai.configure(api_key=API_KEY)

#instance of the GenerativeModel
model = genai.GenerativeModel("gemini-1.5-flash")

# Load question datasets
math_questions = pd.read_csv("D:/codebase/KCETPrepApp/backend/datasets/Math_KCET_Questions_Standardized.csv")
chemistry_questions = pd.read_csv("D:/codebase/KCETPrepApp/backend/datasets/Chemistry_KCET_Questions_Standardized.csv")
physics_questions = pd.read_csv("D:/codebase/KCETPrepApp/backend/datasets/Physics_KCET_Questions_Standardized.csv")

# Load KCET Rank Prediction Dataset
dataset_path = "D:/codebase/KCETPrepApp/backend/datasets/kcet_rank_prediction_enhanced_dataset.csv"
rank_prediction_data = pd.read_csv(dataset_path)

# Load question hierarchy JSON during initialization
try:
    # Calculate the absolute path to the JSON file
    hierarchy_path = os.path.abspath("datasets/final_sorted_hierarchy.json")
    print(f"Loading hierarchy from: {hierarchy_path}")  # Debug log
    with open(hierarchy_path, 'r') as f:
        hierarchy_data = json.load(f)
        print("Hierarchy data successfully loaded.")
except Exception as e:
    print(f"Error loading hierarchy file: {e}")  # Print error for debugging
    hierarchy_data = None  # Ensure the app doesn't crash if loading fails

# Train the rank prediction model
X = rank_prediction_data[['KCET_Score', 'PUC_Physics', 'PUC_Chemistry', 'PUC_Mathematics']]
y = rank_prediction_data['Rank']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

rank_model = RandomForestRegressor(random_state=42, n_estimators=100)
rank_model.fit(X_train, y_train)

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
        print('Request received at /generate_custom_practice')  # Debug log
        data = request.json
        print('Request body:', data)  # Debug log

        token = request.headers.get('Authorization')
        print('Token received:', token)  # Debug log

        user = users_collection.find_one({"token": token})
        if not user:
            print('User not found for token:', token)  # Debug log
            return jsonify({"error": "User not found"}), 404

        # Get selected topics and subtopics from the request data
        selected_topics = data.get('topics', [])
        selected_subtopics = data.get('subtopics', {})

        # Validate topics and subtopics
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

        # **Reinitialize the custom_practice array for the user**
        users_collection.update_one({"token": token}, {"$set": {"custom_practice": []}})  # Clear the previous session

        # Store the new custom practice data in the database
        users_collection.update_one({"token": token}, {"$set": {"custom_practice": questions}})

        print('Questions saved successfully')  # Debug log
        return jsonify({"message": "Custom practice questions stored successfully"}), 200

    except Exception as e:
        print('Error in /generate_custom_practice:', str(e))  # Debug log
        return jsonify({"error": str(e)}), 500

# Endpoint to get generate study plan
@app.route('/generate-study-plan', methods=['POST'])
def generate_study_plan():
    try:
        # Check if hierarchy data is loaded
        if not hierarchy_data:
            raise Exception("Hierarchy data is not loaded. Please check the JSON file path.")

        # Parse input data
        data = request.json
        if not data or 'examDate' not in data:
            return jsonify({"error": "Invalid payload. 'examDate' is required."}), 400

        exam_date = dt.fromisoformat(data['examDate'].replace('Z', ''))
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token is required"}), 401

        # Validate user
        user = users_collection.find_one({"token": token})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Extract user and request parameters
        answers = user.get("answers", {})
        weekday_hours = data.get("weekdayHours", 4)
        weekend_hours = data.get("weekendHours", 6)
        stress_mode = data.get("stressMode", False)

        # Validate exam date
        today = dt.now()
        if exam_date <= today:
            return jsonify({"error": "Exam date must be in the future."}), 400

        study_end_date = exam_date - timedelta(days=10)
        total_study_days = (study_end_date - today).days
        if total_study_days <= 0:
            return jsonify({"error": "Not enough time to prepare for the exam."}), 400

        # Hardcoded subjects list
        subjects = ["Math", "Chemistry", "Physics"]

        # Helper function to calculate required study time for subjects
        def calculate_required_time(subject):
            if subject not in hierarchy_data:
                raise Exception(f"Subject '{subject}' not found in hierarchy data.")

            subject_hierarchy = hierarchy_data[subject]
            subject_data = []

            for topic, subtopics in subject_hierarchy.items():
                for subtopic in subtopics:
                    answer = next((a for a in answers.get(f"{subject.lower()}Answers", [])
                                   if a.get("subtopic") == subtopic), None)
                    time = 1.5
                    if answer:
                        accuracy = answer["correct"] / answer["total"] if answer["total"] > 0 else 0
                        time = 2.5 if accuracy < 0.6 else (1.5 if accuracy < 0.85 else 1)

                    subject_data.append({
                        "subject": subject,
                        "topic": topic,
                        "subtopic": subtopic,
                        "time": round(time, 1)
                    })
            return subject_data

        # Calculate required study time for all subjects
        all_topics = []
        for subject in subjects:
            all_topics.extend(calculate_required_time(subject))

        total_required_hours = sum(t["time"] for t in all_topics)
        total_available_hours = total_study_days * (weekday_hours * 5 / 7 + weekend_hours * 2 / 7)

        # Adjust study plan feasibility
        if total_available_hours < total_required_hours:
            scale_factor = total_available_hours / total_required_hours
            for topic in all_topics:
                topic["time"] = round(topic["time"] * scale_factor, 1)

        # Generate daily study plan
        study_plan = []
        backlog_topics = all_topics.copy()
        current_date = today
        day_counter = 1

        while current_date <= study_end_date:
            is_weekend = current_date.weekday() in [5, 6]
            available_hours = weekend_hours if is_weekend else weekday_hours
            if stress_mode:
                available_hours *= 0.75

            day_plan = {"day": day_counter, "subjects": [], "totalHours": 0}
            day_hours = 0
            subjects_map = {}
            remaining_topics = backlog_topics[:]
            backlog_topics = []

            for topic in remaining_topics:
                if day_hours + topic["time"] <= available_hours:
                    day_hours += topic["time"]
                else:
                    remaining_time = available_hours - day_hours
                    if remaining_time > 0:
                        backlog_topics.append({**topic, "time": topic["time"] - remaining_time})
                        topic["time"] = remaining_time
                        day_hours = available_hours
                    else:
                        backlog_topics.append(topic)
                        continue

                subject_name = topic["subject"]
                if subject_name not in subjects_map:
                    subjects_map[subject_name] = {"subject": subject_name, "totalHours": 0, "subtopics": []}

                subjects_map[subject_name]["subtopics"].append({
                    "subtopic": topic["subtopic"],
                    "hours": topic["time"]
                })
                subjects_map[subject_name]["totalHours"] += topic["time"]

            day_plan["subjects"] = list(subjects_map.values())
            day_plan["totalHours"] = day_hours
            study_plan.append(day_plan)

            current_date += timedelta(days=1)
            day_counter += 1

        # Build response
        response = {
            "studyPlan": study_plan,
            "totalStudyHours": total_required_hours,
            "daysLeft": total_study_days,
            "weekdayHours": weekday_hours,
            "weekendHours": weekend_hours,
            "stressMode": stress_mode
        }
        return jsonify(response)

    except Exception as e:
        print(f"Error: {str(e)}", flush=True)
        return jsonify({"error": str(e)}), 500
    
# Endpoint to save Generated Study Plan
@app.route('/save-study-plan', methods=['POST'])
def save_study_plan():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token is required"}), 401

        user = users_collection.find_one({"token": token})
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.json
        if not data or 'studyPlan' not in data:
            return jsonify({"error": "Invalid payload. 'studyPlan' is required."}), 400

        start_date = dt.utcnow().strftime('%Y-%m-%d')  # Save the current date as the start date

        # Save study plan and start date
        users_collection.update_one(
            {"token": token},
            {"$set": {"studyPlan": data['studyPlan'], "startDate": start_date}}
        )

        return jsonify({"message": "Study plan saved successfully."}), 200
    except Exception as e:
        print(f"Error saving study plan: {str(e)}", flush=True)
        return jsonify({"error": str(e)}), 500


# Endpoint to get the user's study plan    
@app.route('/get-study-plan', methods=['GET'])
def get_study_plan():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token is required"}), 401

        user = users_collection.find_one({"token": token})
        if not user:
            return jsonify({"error": "User not found"}), 404

        study_plan = user.get('studyPlan', [])
        start_date = user.get('startDate')

        if not study_plan or not start_date:
            return jsonify({"error": "No study plan found."}), 404

        # Calculate days elapsed since the start date
        today = dt.utcnow().date()
        start_date = dt.strptime(start_date, '%Y-%m-%d').date()
        days_elapsed = (today - start_date).days + 1  # Day 1 is inclusive

        # Adjust study plan to show only the remaining days
        remaining_plan = [
            {**day, "day": index + days_elapsed}
            for index, day in enumerate(study_plan[days_elapsed - 1 :])
        ]

        return jsonify({"studyPlan": remaining_plan, "currentDay": days_elapsed}), 200
    except Exception as e:
        print(f"Error fetching study plan: {str(e)}", flush=True)
        return jsonify({"error": str(e)}), 500



@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    try:
    
        data = request.json
        print("Debug: Request data:", data)

        prompt = data.get('prompt', '')
        max_tokens = data.get('max_tokens', 500)

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        # Call the Gemini API using the model's generate_content method
        response = model.generate_content([prompt])

        # Log the response from Gemini API
        print("Debug: Response from Gemini API:", response)

        return jsonify({"response": response.text})  
    except Exception as e:
        print("Debug: Error occurred:", e)
        return jsonify({"error": str(e) }), 500
    

@app.route('/predict_rank', methods=['POST'])
def predict_rank():
    try:
        # Fetch the total marks from the backend and user input for PUC marks
        data = request.json
        total_marks = data.get('totalMarks')  # Fetch total KCET marks
        physics_pu_marks = data.get('physicsPU')
        chemistry_pu_marks = data.get('chemistryPU')
        math_pu_marks = data.get('mathPU')

        if not (total_marks and physics_pu_marks and chemistry_pu_marks and math_pu_marks):
            return jsonify({"error": "All inputs (totalMarks, physicsPU, chemistryPU, mathPU) are required"}), 400

        # Prepare data for prediction
        input_data = np.array([[total_marks, physics_pu_marks, chemistry_pu_marks, math_pu_marks]])
        predicted_rank = rank_model.predict(input_data)[0]

        return jsonify({"predictedRank": int(predicted_rank)}), 200

    except Exception as e:
        print(f"Error in /predict_rank: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
