require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ================= ENV CONFIG =================
const ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;

const CONFIG = {
  development: {
    db: process.env.MONGO_URI_DEV,
    logLevel: "debug"
  },
  staging: {
    db: process.env.MONGO_URI_STAGING,
    logLevel: "info"
  },
  production: {
    db: process.env.MONGO_URI_PROD,
    logLevel: "error"
  }
};

const currentConfig = CONFIG[ENV];

// ================= DB CONNECTION =================
mongoose.connect(currentConfig.db)
  .then(() => console.log(`DB Connected (${ENV})`))
  .catch(err => console.error("DB Error:", err));

// ================= LOGGER =================
function log(level, message) {
  const levels = ["debug", "info", "error"];
  if (levels.indexOf(level) >= levels.indexOf(currentConfig.logLevel)) {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

// ================= REQUEST MONITOR =================
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const time = Date.now() - start;
    log("info", `${req.method} ${req.url} - ${time}ms`);

    if (time > 200) {
      log("error", `Slow response: ${time}ms`);
    }
  });

  next();
});

// ================= SAMPLE ROUTE =================
app.get("/", (req, res) => {
  res.send(`Running in ${ENV} mode`);
});

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    environment: ENV,
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// ================= METRICS =================
let requestCount = 0;

app.use((req, res, next) => {
  requestCount++;
  next();
});

app.get("/metrics", (req, res) => {
  res.json({
    totalRequests: requestCount,
    uptime: process.uptime()
  });
});

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  log("error", err.message);
  res.status(500).send("Internal Server Error");
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${ENV})`);
});
