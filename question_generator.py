import streamlit as st
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure the Gemini AI model
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    st.error("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.")
    st.stop()

# Configure the AI model
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

# Define the function to generate questions
def generate_questions(formula):
    prompt = f"""
    Based on the formula(s) provided: "{formula}", generate 20-25 KCET-level multiple-choice questions. 
    Ensure that the questions are clear, accurate, and relevant to the topic covered by the formula. 
    Each question must have four options and indicate the correct answer.
    """
    for attempt in range(MAX_RETRIES):
        try:
            st.write(f"Debug: Attempt {attempt + 1} to generate questions.")
            response = model.generate_content([prompt])
            st.write("Debug: Successfully received response from the API.")
            return response.text
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                st.warning(f"An error occurred. Retrying in {RETRY_DELAY} seconds... (Attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
            else:
                st.error(f"Failed to generate questions after {MAX_RETRIES} attempts. Error: {str(e)}")
                return "An error occurred while generating questions. Please try again later."

# Streamlit application
def main():
    st.title("KCET Question Generator")
    st.write("Input a formula, and Gemini AI will generate KCET-level questions based on it.")

    # Input for formula(s)
    formula_input = st.text_area("Enter the formula(s):", placeholder="e.g., F = ma, E = mc^2")

    # Button to generate questions
    if st.button("Generate Questions"):
        if formula_input.strip():
            with st.spinner("Generating questions..."):
                st.write("Debug: Formula input received.")
                questions = generate_questions(formula_input)
                st.subheader("Generated Questions:")
                st.write(questions)
        else:
            st.warning("Please enter at least one formula.")

if __name__ == "__main__":
    main()
