const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));

// Example prediction endpoint
app.get("/predict", async (req, res) => {
  // Replace this with your ML logic
  const currentPrice = 30000; // Example current price
  const predictedPrice = currentPrice + Math.random() * 1000 - 500; // Simulated prediction
  res.json({ current_price: currentPrice, predicted_price: predictedPrice });
});

exports.api = functions.https.onRequest(app);