const http = require("http");
const fs = require("fs");

const myServer = http.createServer((req, res) => {
    const log = `${Date.now()}: ${req.url} New req received\n`;

    fs.appendFile("log.txt", log, (err) => {
        if (err) {
            console.error("Error writing to log file:", err);
        }
    });

    switch (req.url) {
        case "/":
            res.end("Homepage");
            break;
        case "/about":
            res.end("About Page");
            break;
        case "/contact":
            res.end("Contact Page");
            break;
        default:
            res.end("404 Not Found");
    }
});

myServer.listen(8000, () => {
    console.log("Server Started on port 8000");
});
