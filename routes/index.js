var express = require("express");
var router = express.Router();
var path = require("path");
var determine = require("./determine.js");

router.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname, '/build/index.html'));
})
module.exports = router;
