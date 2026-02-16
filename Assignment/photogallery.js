const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/gallery", (req, res) => {
  const images = ["img01.jpg", "img02.jpg", "img03.jpg"];
  res.render("gallery", { images });
});

app.listen(3000,()=>{
    console.log("Server started successfully");
});
