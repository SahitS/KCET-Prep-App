# Import required libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, AdaBoostRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, explained_variance_score

# Load the dataset
dataset_path = "C:/Users/sahits/Downloads/kcet_rank_prediction_enhanced_dataset.csv"
rank_prediction_data = pd.read_csv(dataset_path)

# Prepare the dataset
X = rank_prediction_data[['KCET_Score', 'PUC_Physics', 'PUC_Chemistry', 'PUC_Mathematics']]
y = rank_prediction_data['Rank']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define models to evaluate
models = {
    "Linear Regression": LinearRegression(),
    "Ridge Regression": Ridge(alpha=1.0),
    "Lasso Regression": Lasso(alpha=0.1),
    "Decision Tree": DecisionTreeRegressor(random_state=42),
    "Random Forest": RandomForestRegressor(random_state=42, n_estimators=100),
    "Gradient Boosting": GradientBoostingRegressor(random_state=42),
    "AdaBoost Regressor": AdaBoostRegressor(random_state=42),
    "Support Vector Regressor (SVR)": SVR(kernel='rbf')
}

# Train and evaluate each model
results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    # Evaluate the model
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    accuracy = explained_variance_score(y_test, y_pred) * 100  # Accuracy as explained variance score

    results[name] = {"MAE": mae, "MSE": mse, "R^2": r2, "Accuracy (%)": accuracy}

# Convert results to a DataFrame for better visualization
results_df = pd.DataFrame(results).T.sort_values(by="R^2", ascending=False)

# Print the evaluation results
print("\nModel Evaluation Results:")
print(results_df)

# Identify the best model
best_model_name = results_df.index[0]
best_model_metrics = results_df.loc[best_model_name]
best_model = models[best_model_name]

# Visualization 1: R^2 scores
plt.figure(figsize=(10, 6))
results_df["R^2"].plot(kind='bar', color='skyblue', alpha=0.8)
plt.title("Model Comparison Based on R^2 Score")
plt.ylabel("R^2 Score")
plt.xlabel("Models")
plt.grid(axis='y', alpha=0.3)
plt.xticks(rotation=45)
plt.show()

# Visualization 2: Heatmap of model metrics
plt.figure(figsize=(10, 8))
sns.heatmap(results_df, annot=True, fmt=".2f", cmap="coolwarm", cbar=True)
plt.title("Model Performance Metrics")
plt.show()

# Visualization 3: Predicted vs Actual scatter plot for the best model
y_pred_best = best_model.predict(X_test)
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred_best, alpha=0.5, color="purple", label="Predicted vs Actual")
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=2, label="Ideal Fit")
plt.title(f"{best_model_name} - Predicted vs Actual Ranks")
plt.xlabel("Actual Ranks")
plt.ylabel("Predicted Ranks")
plt.legend()
plt.grid(alpha=0.3)
plt.show()

# Visualization 4: Feature importance (if applicable)
if hasattr(best_model, "feature_importances_"):
    plt.figure(figsize=(10, 6))
    sns.barplot(x=X.columns, y=best_model.feature_importances_, color='teal', alpha=0.8)
    plt.title(f"{best_model_name} - Feature Importance")
    plt.ylabel("Importance")
    plt.xlabel("Features")
    plt.grid(axis='y', alpha=0.3)
    plt.show()

# Visualization 5: Residual distribution
residuals = y_test - y_pred_best
plt.figure(figsize=(10, 6))
sns.histplot(residuals, kde=True, color='orange', alpha=0.8, bins=30)
plt.title(f"{best_model_name} - Residual Distribution")
plt.xlabel("Residuals (Actual - Predicted)")
plt.ylabel("Frequency")
plt.grid(alpha=0.3)
plt.show()

# Print the best model's name and its metrics
print("\nBest Model:")
print(f"Model Name: {best_model_name}")
print(f"Metrics: {best_model_metrics}")

# User input for rank prediction
def predict_rank():
    print("\nEnter the following details for rank prediction:")
    try:
        kcet_score = int(input("Enter KCET total marks (out of 180): "))
        puc_physics = int(input("Enter PUC Physics marks (out of 100): "))
        puc_chemistry = int(input("Enter PUC Chemistry marks (out of 100): "))
        puc_mathematics = int(input("Enter PUC Mathematics marks (out of 100): "))
        
        # Validate the inputs
        if not (0 <= kcet_score <= 180 and 0 <= puc_physics <= 100 and 
                0 <= puc_chemistry <= 100 and 0 <= puc_mathematics <= 100):
            print("Invalid input! Please ensure marks are within valid ranges.")
            return
        
        # Prepare the input for prediction
        input_data = np.array([[kcet_score, puc_physics, puc_chemistry, puc_mathematics]])
        predicted_rank = best_model.predict(input_data)[0]
        
        print(f"\nPredicted KCET Rank: {int(predicted_rank)}")
    except ValueError:
        print("Invalid input! Please enter numerical values only.")

# Call the prediction function
predict_rank()
