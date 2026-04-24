const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const users = [];

// 🔐 Password Validation Function
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Must include at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Must include at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Must include at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Must include at least one special character");
  }

  return errors;
}

// 📝 Registration Endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check duplicate email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Validate password
    const errors = validatePassword(password);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword
    };

    users.push(newUser);

    return res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// 🚀 Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
