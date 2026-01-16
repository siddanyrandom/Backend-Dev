const http = require("http");
const fs = require("fs");

const myServer = http.createServer((req, res) => {
    let responseText = "";

    const log = `${Date.now()}  ${req.method}  ${req.url}\n`;

    fs.appendFile("log.txt", log, (err) => {
        if (err) {
            console.error("Error in logging:", err);
        }
    });

    switch (req.url) {
        case "/":
            res.end("This is Homepage");
            break;
        case "/about":
            res.end("This is About Page");
            break;
        case "/contact":
            res.end("This is Contact Page");
            break;
        default:
            res.end("404 Not Found");
    }
    
});

myServer.listen(8000, () => {
    console.log("Server started successfully");
});
