const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const session = require('express-session');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// ================= Session =================
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ================= Dummy Users =================
const users = [
  { id: 1, username: "john", password: "1234" }
];

// ================= Serialize =================
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// ================= Local Strategy =================
passport.use('local', new LocalStrategy(
  (username, password, done) => {
    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return done(null, false, { message: "Invalid credentials" });
    }

    return done(null, user);
  }
));

// ================= JWT Strategy =================
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'jwt-secret'
};

passport.use('jwt', new JwtStrategy(opts, (payload, done) => {
  const user = users.find(u => u.id === payload.id);

  if (!user) {
    return done(null, false);
  }

  return done(null, user);
}));

// ================= Login (Session) =================
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).send("Server error");
    if (!user) return res.status(401).json(info);

    req.login(user, (err) => {
      if (err) return res.status(500).send("Login error");

      return res.send("Session login successful");
    });
  })(req, res, next);
});

// ================= API Login (JWT) =================
app.post('/auth/api-login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).send("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    'jwt-secret',
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// ================= Middleware =================
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }
  next();
}

// ================= Session Protected =================
app.get('/dashboard', isLoggedIn, (req, res) => {
  res.send(`Welcome ${req.user.username} (Session Auth)`);
});

// ================= JWT Protected =================
app.get('/api/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      message: "JWT Auth success",
      user: req.user
    });
  }
);

// ================= Switch Auth Method Info =================
app.get('/auth/methods', (req, res) => {
  res.json({
    session: "Use /auth/login",
    jwt: "Use /auth/api-login"
  });
});

// ================= Error Handling =================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong");
});

// ================= Server =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
