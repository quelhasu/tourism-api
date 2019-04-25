var express = require('express');
var router = express.Router({ mergeParams: true });
var writeResponse = require('../helpers/response').writeResponse
var Updater = require('../helpers/update');
var dbUtils = require('../neo4j/dbUtils');
var Info = require("../models/info");
var International = require("../models/international");

router.get("/", (req, res, next) => {
  res.send("hey");
});

router.get("/:year/", async (req, res, next) => {
  params = {
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 10,
    AGES: Updater.ages(req.query.ages),
  };

  const tops = await getInternationalInfo(req);
  params['COUNTRIES'] = Object.keys(req.query).includes('countries') ? req.query.countries.split(',') : tops['topCountries'];
  params['TYPER'] = Object.keys(req.query).includes('typer') ? req.query.typer.split(',') : ['R', 'A', 'H'];

  // Monthly evolution
  const monthly = await International.getMonths(dbUtils.getSession(req), params);

  // YEAR
  const totReviews = await International.getTotalByYear(dbUtils.getSession(req), params);
  International.getCountriesValuesByYear(dbUtils.getSession(req), params, totReviews).then(async values => {
    // YEAR - 1
    params['YEAR'] = params.YEAR - 1;
    const oldTotReviews = await International.getTotalByYear(dbUtils.getSession(req), params);
    International.getCountriesValuesByYear(dbUtils.getSession(req), params, oldTotReviews, values).then(finalArray => {
      writeResponse(res, {
        "TotalReviews": totReviews,
        "Evolution": Updater.diff(finalArray),
        "Monthly": monthly
      });
    })
  })
});


router.get("/:year/info", (req, res, next) => {
  params = {
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 20
  };
  getInternationalInfo(req).then(tops => writeResponse(res, tops));
});

const getInternationalInfo = (req) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      Info.getTopCountries(dbUtils.getSession(req), params),
      Info.getAgeRanges(dbUtils.getSession(req)),
    ])
      .then(([topCountries, topAges]) => {
        resolve({
          "topCountries": topCountries,
          "topAges": topAges,
        })
      })
      .catch(err => {
        console.log(err);
      })
  })
}

module.exports = router;