// This file handles the boot-up of the server 
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

require('dotenv').config();

const { databaseConnect } = require('./database');
const { app } = require('./server');
const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("MongoDB connection error:", error));

// Routes
app.use("/api/users", require("./routes/users"));

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.listen(3000, async () => {
	await databaseConnect();
	console.log("Server running!");
});