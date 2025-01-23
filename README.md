KCET Prep App

Welcome to the KCET Prep App! This project is designed to assist students preparing for the Karnataka Common Entrance Test (KCET). It offers a comprehensive suite of features like personalized study plans, rank prediction, AI-integrated lessons, flashcards, and more.

Project Overview

This application is built using Angular (v18.2.7) and integrates a robust backend powered by Flask, Node.js, and MongoDB. It supports:

Personalized Study Plans: Calendar-based plans with dependency graphs for efficient scheduling.

Practice Tests: Simulations of KCET exams with subject-wise performance tracking.

Custom Practice: Create sessions tailored to specific topics, subtopics, and difficulty levels.

Result Analysis: Detailed subject-wise and topic-wise performance analysis.

Rank Prediction: AI-powered rank estimation based on mock test results.

Lessons with AI Chatbot: Interactive flashcards and topic-based Q&A.

Flashcards: Organized notes for Physics, Chemistry, and Mathematics.

Steps to Run the Code

1. Clone the Repository

Open a terminal/command prompt.

Clone the repository using the following command:

git clone https://github.com/SahitS/KCET-Prep-App.git

Navigate into the project directory:

cd KCET-Prep-App

2. Install Node.js

Download Node.js:

Visit the Node.js official website.

Download and install the LTS version.

Verify Installation:

node -v
npm -v

Ensure the installed versions are displayed.

3. Install MongoDB

Download MongoDB:

Visit the MongoDB official website.

Download and install the Community Edition.

Start MongoDB:

If installed as a service, it will start automatically.

Alternatively, start it manually:

mongod

4. Install Angular CLI

Install Angular CLI globally:

npm install -g @angular/cli

Verify installation:

ng version

5. Install Python

Download Python:

Visit the Python official website.

Download and install Python (ensure you check the box Add Python to PATH during installation).

Verify Installation:

python --version
pip --version

6. Install Required Python Packages

Navigate to the backend directory:

cd backend

Install the required Python packages:

pip install -r requirements.txt

Verify Flask installation:

python -m flask --version

7. Install Node.js Dependencies

Navigate back to the main project directory:

cd ..

Install the required npm packages:

npm install

8. Start the Angular Frontend

Navigate to the frontend directory:

cd src

Start the Angular application:

npm start

Open your browser and go to:
http://localhost:4200

9. Start the Node.js Server

Navigate back to the root project directory:

cd ..

Start the Node.js server:

node server.js

10. Start the Flask Backend

Navigate to the backend directory:

cd backend

Start the Flask application:

python -m flask run

The Flask server will be running at:
http://127.0.0.1:5000

11. Final Setup

Ensure all services are running:

MongoDB

Angular frontend

Node.js backend

Flask backend

Access your application through the Angular frontend (likely at http://localhost:4200).

Features

Personalized Study Plans

AI-driven, calendar-based plans with dependency graph visualization.

Tailored schedules based on exam date and daily study preferences.

Practice Tests

Subject-specific tests simulating the KCET experience.

Timer-based test simulation with real-time answer tracking.

Result Analysis

Comprehensive breakdown of performance by subjects, topics, and time allocation.

Visual graphs for easy understanding of strengths and weaknesses.

Custom Practice

Create sessions focused on specific topics and difficulty levels.

Real-time feedback on answer correctness.

Rank Prediction

AI-based rank estimation to gauge your readiness.

Lessons with AI Chatbot

Flashcards integrated with an AI chatbot for interactive learning.

Topic-based Q&A to clear doubts effectively.

Flashcards

Well-organized notes and formulas for Physics, Chemistry, and Mathematics.

Easy navigation by chapters and topics.

Deployment

Build

Run ng build to build the project for production. The build artifacts will be stored in the dist/ directory.

Testing

Unit Tests: Run ng test with Karma.

E2E Tests: Add an E2E testing library and execute with ng e2e.

Deployment to Server

Bundle the frontend using the production build.

Deploy the backend servers (Flask and Node.js) on hosting platforms such as AWS or Heroku.

Connect the frontend to the backend using appropriate API routes.

Future Enhancements

Gamification: Reward system for achieving study milestones.

Community Support: Peer-to-peer discussion forums.

Adaptive Learning: AI-driven topic suggestions based on performance trends.

Contributors

This project was developed by a dedicated team passionate about enhancing education through technology.

License

This project is licensed under the MIT License.
