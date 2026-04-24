const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

// ================= Session =================
app.use(session({
  secret: 'auth-secret',
  resave: false,
  saveUninitialized: false
}));

// ================= Dummy Data =================
const users = [
  { id: 1, username: "user1", role: "user" },
  { id: 2, username: "mod1", role: "moderator" },
  { id: 3, username: "admin1", role: "admin" }
];

const posts = [];

// ================= Fake Login =================
app.post('/login', (req, res) => {
  const { userId } = req.body;

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).send("User not found");

  req.session.user = user;
  res.send("Logged in");
});

// ================= Auth Middleware =================
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
};

// ================= Role Middleware =================
const requireRole = (role) => {
  return (req, res, next) => {
    const userRole = req.session.user.role;

    if (userRole === "admin") return next(); // admin can do everything

    if (userRole !== role) {
      return res.status(403).send("Forbidden");
    }

    next();
  };
};

// ================= Ownership Check =================
const isOwnerOrModerator = (req, res, next) => {
  const post = posts.find(p => p.id == req.params.id);

  if (!post) return res.status(404).send("Post not found");

  const user = req.session.user;

  if (
    post.userId === user.id || 
    user.role === "moderator" || 
    user.role === "admin"
  ) {
    req.post = post;
    return next();
  }

  return res.status(403).send("Not allowed");
};

// ================= Create Post =================
app.post('/posts', isAuthenticated, (req, res) => {
  const newPost = {
    id: posts.length + 1,
    userId: req.session.user.id,
    content: req.body.content
  };

  posts.push(newPost);

  res.status(201).json(newPost);
});

// ================= Edit Post =================
app.put('/posts/:id', isAuthenticated, isOwnerOrModerator, (req, res) => {
  req.post.content = req.body.content;
  res.send("Post updated");
});

// ================= Delete Post =================
app.delete('/posts/:id',
  isAuthenticated,
  requireRole('moderator'),
  (req, res) => {

    const index = posts.findIndex(p => p.id == req.params.id);

    if (index === -1)
      return res.status(404).send("Post not found");

    posts.splice(index, 1);

    res.send("Post deleted");
});

// ================= Server =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
