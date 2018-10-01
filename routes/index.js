var express = require("express");
var router = express.Router();
var path = require("path");
var determine = require("./determine.js");

router.get("/determine", function(req, res, next) {
  console.log(req.query);
  determine(req.query.data.trim(), determineFinished, req, res);
});


function determineFinished(req, res, results) {
  console.log(results);
  res.status(200).json(results);
}

router.get("/", function(req, res, next) {
  res.render("index");
});

module.exports = router;
