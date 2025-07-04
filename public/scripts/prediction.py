from flask import Flask, jsonify, render_template
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import pandas as pd

app = Flask(__name__)

# Load the trained model
model = load_model("../models/bitcoin_price_model.h5")
scaler = MinMaxScaler(feature_range=(0, 1))

# Fetch historical data (replace with API call in production)
def fetch_historical_data():
    data = pd.read_csv("../data/bitcoin_prices.csv")  # Example CSV file
    return data["Close"].values[-60:]  # Last 60 prices

# Predict Bitcoin price
def predict_bitcoin_price():
    historical_prices = fetch_historical_data()
    scaled_prices = scaler.fit_transform(historical_prices.reshape(-1, 1))
    X = np.array([scaled_prices])
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    predicted_price = model.predict(X)
    predicted_price = scaler.inverse_transform(predicted_price)
    return {"predicted_price": float(predicted_price[0][0])}

@app.route("/")
def home():
    return render_template("prediction.html")

@app.route("/predict")
def predict():
    prediction = predict_bitcoin_price()
    return jsonify(prediction)

if __name__ == "__main__":
    app.run(debug=True)