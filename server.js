const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const cors = require("cors");
app.use(express.json()); 

app.use(cors({ origin: "*" }));
// app.use(cors({ origin: "http://localhost:3000" }));


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Endpoint to initiate a transaction
app.post("/api/initiate-transaction", async (req, res) => {
  const { email, amount } = req.body;

  // Validating the request body
  if (!email || !amount) {
    return res.status(400).json({ error: "Email and amount are required" });
  }

  try {
    // Convert amount to kobo
    const amountInKobo = amount * 100;

    // Transaction initializs
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email,
        amount: amountInKobo,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: "An error occurred while initiating the transaction" });
  }
});

// Endpoint to verify a transaction
app.post("/api/verify-payment", async (req, res) => {
    const { reference } = req.body;
  
    try {
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });
  
      if (response.data.status && response.data.data.status === "success") {
        res.json({ status: "success", data: response.data.data });
      } else {
        res.status(400).json({ status: "error", message: "Payment not successful" });
      }
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
