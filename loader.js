var express = require("express");
var launcher = express();
var path = require("path");

launcher.use(express.static(path.join(__dirname, "/src")));

launcher.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

launcher.listen(8080, () => {
  //console.log("Chat active at http://localhost:8080");
});