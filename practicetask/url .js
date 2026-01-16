const url = require("url");
const http = require("http");

const myServer = http.createServer((req, res) => {
  const myUrl = url.parse(req.url, true);
  console.log(myUrl);

  switch (myUrl.pathname) {
    case "/":
      res.end("This is home page");
      break;
    case "/about":
      const username = myUrl.query.myname;
      res.end(`Hi, ${username}`);
      break;
    default:
      res.end("Error 404 Page not found");
  }
});

myServer.listen(8000, () => {
  console.log("Server running at port 8000");
});
