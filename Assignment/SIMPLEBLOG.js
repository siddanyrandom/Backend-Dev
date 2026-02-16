const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let posts = [];

app.get("/posts", (req, res) => {
  res.render("posts", { posts });
});

app.get("/posts/:id", (req, res) => {
  const post = posts[req.params.id];
  res.render("post", { post });
});

app.get("/new", (req, res) => {
  res.render("new");
});

app.post("/posts", (req, res) => {
  posts.push(req.body);
  res.redirect("/posts");
});

app.listen(3000,()=>{
    console.log("Server has  started successfully");
});
