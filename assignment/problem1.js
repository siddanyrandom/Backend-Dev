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

const app = express();

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("DB Connected"))
.catch(err=> console.log(err));

// ================= Models =================
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, default: "user" }
});

const productSchema = new mongoose.Schema({
  name: String,
  price: { type: Number, min: 0 } // prevent negative price
});

const reviewSchema = new mongoose.Schema({
  text: String,
  user: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Review = mongoose.model("Review", reviewSchema);

// ================= Middleware =================
app.use(express.json());

// Helmet (Security headers)
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "https://cdn.example.com"],
    scriptSrc: ["'self'", "https://checkout.payment.com"],
    frameSrc: ["'self'", "https://www.youtube.com"],
  }
}));

// Mongo sanitize
app.use(mongoSanitize());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    maxAge: 1000 * 60 * 30
  }
}));

// Rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
app.use("/login", loginLimiter);

// ================= Auth =================
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if(password.length < 6)
    return res.send("Weak password");

  const hash = await bcrypt.hash(password, 10);

  await User.create({ email, password: hash });
  res.send("User registered");
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if(!user) return res.send("User not found");

  const match = await bcrypt.compare(req.body.password, user.password);
  if(!match) return res.send("Wrong password");

  req.session.regenerate(err => {
    if(err) return res.send("Error");

    req.session.user = {
      id: user._id,
      role: user.role
    };

    res.send("Login successful");
  });
});

// ================= Auth Middleware =================
function isAuth(req, res, next) {
  if(!req.session.user) return res.send("Unauthorized");
  next();
}

function isAdmin(req, res, next) {
  if(req.session.user.role !== "admin")
    return res.send("Forbidden");
  next();
}

// ================= Product Search =================
app.get("/search", async (req, res) => {
  const query = req.query.q;

  const products = await Product.find({
    name: { $regex: query, $options: "i" }
  });

  res.json(products);
});

// ================= Review (XSS Safe) =================
app.post("/review", isAuth, async (req, res) => {
  const clean = xss(req.body.text);

  await Review.create({
    text: clean,
    user: req.session.user.id
  });

  res.send("Review added safely");
});

// ================= Admin Route =================
app.get("/admin", isAuth, isAdmin, (req, res) => {
  res.send("Welcome Admin");
});

// ================= Server =================
app.listen(3000, () => console.log("Server running on port 3000"));
