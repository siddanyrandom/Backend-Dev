require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss");
const crypto = require("crypto");
const validator = require("validator");

const app = express();
app.use(express.json());

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("DB Connected"))
.catch(err=> console.log(err));

// ================= Security Middleware =================
app.use(helmet());
app.use(mongoSanitize());

// ================= Session =================
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: false, // true in production
    maxAge: 1000 * 60 * 15
  }
}));

// ================= Rate Limiting =================
const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 5 });
const transferLimiter = rateLimit({ windowMs: 10*60*1000, max: 3 });

app.use("/login", loginLimiter);
app.use("/transfer", transferLimiter);

// ================= Models =================
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: { type: Number, default: 0 },
  resetToken: String,
  resetExpires: Date
});

const transactionSchema = new mongoose.Schema({
  from: String,
  to: String,
  amount: Number,
  description: String,
  time: Date
});

const auditSchema = new mongoose.Schema({
  userId: String,
  action: String,
  details: String,
  time: Date
});

const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Audit = mongoose.model("Audit", auditSchema);

// ================= Auth =================
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!validator.isEmail(email))
    return res.send("Invalid email");

  if (password.length < 8)
    return res.send("Weak password");

  const hash = await bcrypt.hash(password, 12);
  await User.create({ email, password: hash });

  res.send("Registered");
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send("Invalid credentials");

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.send("Invalid credentials");

  req.session.regenerate(() => {
    req.session.user = { id: user._id };
    res.send("Login success");
  });
});

// ================= Middleware =================
function isAuth(req, res, next) {
  if (!req.session.user) return res.send("Unauthorized");
  next();
}

// ================= Transfer (SECURE) =================
app.post("/transfer", isAuth, async (req, res) => {
  let { to, amount, description } = req.body;

  // Validate
  if (!validator.isNumeric(amount.toString()) || amount <= 0)
    return res.send("Invalid amount");

  amount = Number(amount);

  const user = await User.findById(req.session.user.id);
  if (user.balance < amount)
    return res.send("Insufficient funds");

  // 2FA for high amount
  if (amount > 1000) {
    return res.send("2FA required (OTP step)");
  }

  // Sanitize
  description = xss(description);

  user.balance -= amount;
  await user.save();

  await Transaction.create({
    from: user._id,
    to,
    amount,
    description,
    time: new Date()
  });

  logAudit(user._id, "TRANSFER", `Sent ${amount}`);

  res.send("Transfer successful");
});

// ================= Transactions =================
app.get("/transactions", isAuth, async (req, res) => {
  const data = await Transaction.find({
    from: req.session.user.id
  });

  res.json(data);
});

// ================= Password Reset =================
app.post("/reset-request", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send("OK");

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetExpires = Date.now() + 10 * 60 * 1000; // 10 min

  await user.save();

  res.send("Reset link sent");
});

app.post("/reset-password", async (req, res) => {
  const user = await User.findOne({
    resetToken: req.body.token,
    resetExpires: { $gt: Date.now() }
  });

  if (!user) return res.send("Invalid/Expired token");

  user.password = await bcrypt.hash(req.body.password, 12);
  user.resetToken = null;

  await user.save();

  res.send("Password updated");
});

// ================= Audit =================
function logAudit(userId, action, details) {
  Audit.create({
    userId,
    action,
    details,
    time: new Date()
  });
}

// ================= Error Handling =================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong"); // no leak
});

// ================= Server =================
app.listen(3000, () => console.log("Bank Server Running"));
