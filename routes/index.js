var express = require("express");
var router = express.Router();
var writeResponse = require("../helpers/response").writeResponse;
var dbUtils = require("../neo4j/dbUtils");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});


module.exports = router;
