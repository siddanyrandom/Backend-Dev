const express = require("express");
const connectDB = require("./config/db");

const app = express();


app.use(express.json());

connectDB();

const taskRoutes = require("./routes/taskRoutes");
app.use("/api", taskRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log("Server started"));
