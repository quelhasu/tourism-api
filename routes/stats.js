var express = require('express');
var router = express.Router({ mergeParams: true });
var writeResponse = require('../helpers/response').writeResponse
var dbUtils = require('../neo4j/dbUtils');
var Stats = require("../models/stats");

router.get("/", (req, res, next) => {
  Stats.getDatabaseStats(dbUtils.getSession(req))
    .then(response => writeResponse(res, response))
    .catch(next);
});

router.get("/:country", (req, res, next) => {
  params = { COUNTRY: req.params.country.capitalize() };
  Stats.getDatabaseStats(dbUtils.getSession(req))
    .then(response => {
      Stats.getDatabaseCountryStats(dbUtils.getSession(req), params, response).then(response =>
        writeResponse(res, response)
      );
    })
    .catch(next);
});

router.get("/:country/:dep", (req, res, next) => {
  params = {
    COUNTRY: req.params.country.capitalize(), 
    DEP: req.params.dep.capitalize()  
  };
  Stats.getDatabaseStats(dbUtils.getSession(req)).then(response => {
    Stats.getDatabaseCountryStats(dbUtils.getSession(req), params, response).then(response => {
      Stats.getDatabaseDepStats(dbUtils.getSession(req), params, response).then(response =>
        writeResponse(res, response)
      );
    });
  })
    .catch(next);
});

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

module.exports = router;
