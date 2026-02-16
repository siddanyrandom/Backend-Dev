const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  console.log(name, email, message);

  res.send("Form Submitted ");
});

app.listen(3000,()=>{
    console.log("Server started successfully");
});
