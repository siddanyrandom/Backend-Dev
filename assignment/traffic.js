require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");

const app = express();
app.use(express.json());

// ================= CONFIG =================
const PORT = process.env.PORT || 3000;

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// ================= REDIS CACHE =================
const redis = new Redis(process.env.REDIS_URL);

// ================= METRICS =================
let totalRequests = 0;
let slowRequests = 0;

// ================= REQUEST TRACKER =================
app.use((req, res, next) => {
  totalRequests++;
  const start = Date.now();

  res.on("finish", () => {
    const time = Date.now() - start;
    if (time > 2000) slowRequests++;
  });

  next();
});

// ================= PRODUCT CACHE =================
app.get("/product/:id", async (req, res) => {
  const { id } = req.params;

  // Check cache
  const cached = await redis.get(`product:${id}`);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Simulate DB fetch
  const product = {
    id,
    name: "Phone",
    price: 10000
  };

  // Cache for 60 sec
  await redis.set(`product:${id}`, JSON.stringify(product), "EX", 60);

  res.json(product);
});

// ================= INVENTORY SYSTEM =================
const inventory = {
  "p1": 100
};

const reserved = {}; // temp reservation

app.post("/reserve", (req, res) => {
  const { productId, qty } = req.body;

  if (inventory[productId] < qty) {
    return res.status(400).send("Out of stock");
  }

  inventory[productId] -= qty;
  reserved[productId] = (reserved[productId] || 0) + qty;

  res.send("Reserved");
});

// ================= MESSAGE QUEUE =================
const orderQueue = [];

app.post("/order", (req, res) => {
  const { paymentStatus } = req.body;

  if (paymentStatus === "FAILED") {
    orderQueue.push(req.body);
    return res.send("Order queued (payment failed)");
  }

  res.send("Order placed");
});

// ================= PROCESS QUEUE =================
setInterval(() => {
  if (orderQueue.length > 0) {
    console.log("Processing queued orders...");
    orderQueue.splice(0, orderQueue.length);
  }
}, 10000);

// ================= CIRCUIT BREAKER =================
let paymentServiceDown = false;

app.post("/pay", (req, res) => {
  if (paymentServiceDown) {
    return res.status(503).send("Payment service unavailable");
  }

  // Simulate failure
  if (Math.random() < 0.3) {
    paymentServiceDown = true;
    setTimeout(() => paymentServiceDown = false, 10000);
    return res.status(500).send("Payment failed");
  }

  res.send("Payment success");
});

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    uptime: process.uptime()
  });
});

// ================= METRICS =================
app.get("/metrics", (req, res) => {
  res.json({
    totalRequests,
    slowRequests,
    cacheHitNote: "Use Redis MONITOR for real hit rate"
  });
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
