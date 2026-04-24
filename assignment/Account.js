const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// ================= Dummy Users =================
const users = [
  {
    email: "john@example.com",
    password: bcrypt.hashSync("Password123!", 10)
  }
];

// email -> { count, firstAttemptTime, lockUntil }
const loginAttempts = new Map();

// ================= Check Attempts =================
function checkLoginAttempts(email) {
  const data = loginAttempts.get(email);

  if (!data) return { allowed: true };

  // Check if account is locked
  if (data.lockUntil && data.lockUntil > Date.now()) {
    return {
      allowed: false,
      message: "Account locked. Try again later."
    };
  }

  // Reset if 1 hour passed
  if (Date.now() - data.firstAttemptTime > 60 * 60 * 1000) {
    loginAttempts.delete(email);
    return { allowed: true };
  }

  return { allowed: true };
}

// ================= Record Failed =================
function recordFailedAttempt(email) {
  let data = loginAttempts.get(email);

  if (!data) {
    data = {
      count: 1,
      firstAttemptTime: Date.now(),
      lockUntil: null
    };
  } else {
    data.count += 1;
  }

  // Lock account after 5 attempts
  if (data.count >= 5) {
    data.lockUntil = Date.now() + (30 * 60 * 1000); // 30 min
  }

  loginAttempts.set(email, data);
}

// ================= Clear Attempts =================
function clearAttempts(email) {
  loginAttempts.delete(email);
}

// ================= Login =================
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check rate limit
  const check = checkLoginAttempts(email);
  if (!check.allowed) {
    return res.status(429).json({ error: check.message });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    recordFailedAttempt(email);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    recordFailedAttempt(email);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Success 
  clearAttempts(email);

  res.json({ message: "Login successful" });
});

// ================= Server =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
