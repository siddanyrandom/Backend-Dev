const express = require("express");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname));

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(3000,()=>{
    console.log("Server started successfully");
});
