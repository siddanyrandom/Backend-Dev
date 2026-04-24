const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const ACCESS_SECRET = 'access-secret';
const REFRESH_SECRET = 'refresh-secret';

// Dummy users
const users = [
  { id: 1, username: "john", password: "1234" }
];

// Store refresh tokens
const refreshTokens = new Set();

// ================= Generate Tokens =================
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  const token = jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  refreshTokens.add(token); // store securely
  return token;
}

// ================= Login =================
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).send("Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({ accessToken, refreshToken });
});

// ================= Refresh Token =================
app.post('/token/refresh', (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).send("Token required");

  if (!refreshTokens.has(token)) {
    return res.status(403).send("Invalid refresh token");
  }

  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).send("Expired or invalid token");

    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  });
});

// ================= Logout =================
app.post('/logout', (req, res) => {
  const { token } = req.body;

  refreshTokens.delete(token); // invalidate
  res.send("Logged out");
});

// ================= Auth Middleware =================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).send("No token");

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");

    req.user = user;
    next();
  });
}

// ================= Protected Route =================
app.get('/protected', authenticateToken, (req, res) => {
  res.send(`Hello ${req.user.username}, you accessed protected data`);
});

// ================= Server =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
