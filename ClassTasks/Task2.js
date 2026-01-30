const http = require("http");
const url = require("url");

http
  .createServer((req, res) => {
    const { pathname, query } = url.parse(req.url, true);

    
    if (pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Welcome to Node Server");
    } else if (pathname === "/about") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>About Page</h1>");
    } else if (pathname === "/user") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ name: query.name, age: query.age }));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Page Not Found");
    }
  })
  .listen(3000, () => console.log("Server running on port 3000"));
