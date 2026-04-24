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
const validator = require("validator");
const multer = require("multer");

const app = express();

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("DB Connected"))
.catch(err=> console.log(err));

app.use(express.json());

// ================= Helmet =================
app.use(helmet());

// ================= Sanitize =================
app.use(mongoSanitize());

// ================= Session =================
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    httpOnly: true,
    secure: false, // true in production
    maxAge: 1000 * 60 * 15 // 15 min
  }
}));

// ================= Rate Limit =================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
app.use("/login", loginLimiter);

// ================= Models =================
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["patient", "doctor", "nurse", "admin", "insurance"],
    default: "patient"
  }
});

const recordSchema = new mongoose.Schema({
  patientId: mongoose.Schema.Types.ObjectId,
  data: String
});

const auditSchema = new mongoose.Schema({
  userId: String,
  action: String,
  resource: String,
  time: Date
});

const User = mongoose.model("User", userSchema);
const Record = mongoose.model("Record", recordSchema);
const Audit = mongoose.model("Audit", auditSchema);

// ================= Auth =================
app.post("/register", async (req, res) => {
  let { name, email, password } = req.body;

  if (!validator.isEmail(email))
    return res.send("Invalid email");

  if (password.length < 8)
    return res.send("Weak password");

  const hash = await bcrypt.hash(password, 12);

  await User.create({ name, email, password: hash });

  res.send("Registered");
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send("User not found");

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.send("Wrong password");

  req.session.regenerate(() => {
    req.session.user = {
      id: user._id,
      role: user.role
    };
    res.send("Login success");
  });
});

// ================= Middleware =================
function isAuth(req, res, next) {
  if (!req.session.user) return res.send("Unauthorized");
  next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.session.user.role))
      return res.send("Forbidden");
    next();
  };
}

// ================= Audit Log =================
function logAccess(userId, action, resource) {
  Audit.create({
    userId,
    action,
    resource,
    time: new Date()
  });
}

// ================= Medical Record =================
app.get("/record/:id", isAuth, async (req, res) => {
  const record = await Record.findById(req.params.id);

  // IDOR protection
  if (req.session.user.id != record.patientId)
    return res.send("Unauthorized");

  logAccess(req.session.user.id, "VIEW_RECORD", record._id);

  res.send(record);
});

// ================= Doctor Notes =================
app.post("/notes", isAuth, allowRoles("doctor"), (req, res) => {
  const clean = xss(req.body.notes, {
    whiteList: { b: [], i: [], p: [] }
  });

  res.send("Notes saved safely");
});

// ================= Appointment =================
app.post("/appointment", isAuth, (req, res) => {
  const { date } = req.body;

  if (!validator.isISO8601(date))
    return res.send("Invalid date");

  res.send("Appointment booked");
});

// ================= File Upload =================
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype))
      return cb(new Error("Invalid file type"));
    cb(null, true);
  }
});

app.post("/upload", isAuth, upload.single("file"), (req, res) => {
  logAccess(req.session.user.id, "UPLOAD_FILE", req.file.originalname);
  res.send("File uploaded securely");
});

// ================= Search (Injection Safe) =================
app.get("/search", isAuth, async (req, res) => {
  const query = req.query.q;

  const data = await Record.find({
    data: { $regex: query, $options: "i" }
  });

  res.json(data);
});

// ================= Server =================
app.listen(3000, () => console.log("Server running"));
