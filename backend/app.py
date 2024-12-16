from datetime import datetime as dt, timedelta
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

# Define public holidays (example dates)
PUBLIC_HOLIDAYS = ["2024-01-01", "2024-01-15", "2024-03-08"]
@app.route('/generate-study-plan', methods=['POST'])
def generate_study_plan():
    from datetime import datetime as dt, timedelta

    try:
        # Parse input
        data = request.json
        exam_date = dt.fromisoformat(data['examDate'].replace('Z', ''))
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({"error": "Authorization token is required"}), 401

        # Fetch user data
        user = users_collection.find_one({"token": token})
        if not user:
            return jsonify({"error": "User not found"}), 404

        quiz = user.get("quiz", {})
        answers = user.get("answers", {})

        # Get availability and stress preferences
        weekday_hours = data.get("weekdayHours", 4)  # Default 4 hours/day
        weekend_hours = data.get("weekendHours", 6)  # Default 6 hours/day
        stress_mode = data.get("stressMode", False)  # Default to regular schedule

        # Ensure the exam date is in the future
        today = dt.now()
        if exam_date <= today:
            return jsonify({"error": "Exam date must be in the future."}), 400

        # Exclude the last 1.5 weeks before the exam date
        study_end_date = exam_date - timedelta(days=10)
        total_study_days = (study_end_date - today).days

        if total_study_days <= 0:
            return jsonify({"error": "Not enough time to prepare for the exam."}), 400

        # Helper function to calculate revision times for subtopics based on accuracy
        def calculate_required_time(subject):
            subject_data = {}
            for question in quiz.get(subject, []):
                topic, subtopic = question["Topic"], question["Subtopic"]
                answer = next((a for a in answers.get(f"{subject}Answers", [])
                               if a["questionIndex"] == question["questionIndex"]), None)
                correct = 1 if answer and answer["isCorrect"] else 0

                if topic not in subject_data:
                    subject_data[topic] = {"subtopics": {}}

                if subtopic not in subject_data[topic]["subtopics"]:
                    subject_data[topic]["subtopics"][subtopic] = {
                        "total": 0, "correct": 0, "requiredTime": 0
                    }

                subtopic_stats = subject_data[topic]["subtopics"][subtopic]
                subtopic_stats["total"] += 1
                subtopic_stats["correct"] += correct

            # Assign time based on accuracy
            for topic in subject_data.values():
                for subtopic, stats in topic["subtopics"].items():
                    accuracy = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
                    stats["requiredTime"] = 2.5 if accuracy < 0.6 else (1.5 if accuracy < 0.85 else 1)

            return subject_data

        # Calculate performance for each subject
        subjects = ["math", "physics", "chemistry"]
        performance = {subj: calculate_required_time(subj) for subj in subjects}

        # Collect all topics and their required times
        all_topics = []
        for subject, topics in performance.items():
            for topic_name, topic in topics.items():
                for subtopic_name, stats in topic["subtopics"].items():
                    all_topics.append({
                        "subject": subject.title(),
                        "topic": topic_name,
                        "subtopic": subtopic_name,
                        "time": stats["requiredTime"]
                    })

        total_hours = sum(t["time"] for t in all_topics)

        # Study plan generation
        study_plan = []
        current_date = today
        while current_date <= study_end_date:
            is_weekend = current_date.weekday() in [5, 6]
            available_hours = weekend_hours if is_weekend else weekday_hours

            # Adjust hours if stress handling mode is active
            if stress_mode:
                available_hours *= 0.75  # Reduce study load by 25%

            day_plan = {"date": current_date.strftime("%Y-%m-%d"), "subjects": [], "totalHours": 0}
            day_hours = 0
            subjects_map = {}

            for topic in list(all_topics):
                if day_hours + topic["time"] > available_hours:
                    continue

                day_hours += topic["time"]
                day_plan["totalHours"] += topic["time"]
                all_topics.remove(topic)

                subject_name = topic["subject"]
                if subject_name not in subjects_map:
                    subjects_map[subject_name] = {"subject": subject_name, "topics": []}

                subjects_map[subject_name]["topics"].append({
                    "topic": topic["topic"],
                    "subtopics": [{"subtopic": topic["subtopic"], "hours": topic["time"]}]
                })

            # Mock tests on weekends or if close to exam
            if is_weekend or (exam_date - current_date).days <= 5:
                day_plan["mockTest"] = "Mock Test Scheduled"

            day_plan["subjects"] = list(subjects_map.values())
            study_plan.append(day_plan)
            current_date += timedelta(days=1)

        # Prepare and return the response
        response = {
            "studyPlan": study_plan,
            "totalStudyHours": total_hours,
            "daysLeft": total_study_days,
            "weekdayHours": weekday_hours,
            "weekendHours": weekend_hours,
            "stressMode": stress_mode
        }
        return jsonify(response)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500






if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
