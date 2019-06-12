var express = require('express');
var router = express.Router({ mergeParams: true });
var writeResponse = require('../helpers/response').writeResponse
var writeError = require('../helpers/response').writeError
var Updater = require('../helpers/update');
var dbUtils = require('../neo4j/dbUtils');
var Info = require("../models/info");
var International = require("../models/international");

router.get("/", (req, res, next) => {
  res.send("hey");
});

router.get("/:year/annual", async (req, res, next) => {
  try {
    let evolution = {};
    let reviewsArr = {};

    params = {
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 10,
      AGES: Updater.ages(req.query.ages),
      TOPAREAS: Number(req.query.limitareas) || 10,
      TYPER: req.query.typer ? req.query.typer.split(',') : ['R', 'A', 'H']
    };

    // Get top information
    const topAges = await Info.getAgeRanges(dbUtils.getSession(req));
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);

    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : topCountries;

    let selectedYear = params['YEAR'];

    // Year array [selectedYear...selectedYear-3]
    params.YEARS = Updater.yearArray(params['YEAR'], params['YEAR'] - 2);
    reviewsArr = await International.getTotalByYear(dbUtils.getSession(req), params);
    reviewsArr['diff'] = Updater.percentDiff(reviewsArr[selectedYear - 1], reviewsArr[selectedYear])

    evolution = await International.getCountriesValuesByYear(dbUtils.getSession(req), params, reviewsArr);

    writeResponse(res, {
      "TotalReviews": reviewsArr,
      "Evolution": Updater.diff(evolution),
      "TopInfo": {
        "topCountries": topCountries,
        "topAges": topAges
      }
    });
  }
  catch (e) {
    writeError(res, {
      "API Error": e.message
    })
  }
});

router.get("/:year/monthly", async (req, res, next) => {
  try {
    
    params = {
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 10,
      AGES: Updater.ages(req.query.ages),
      TYPER: req.query.typer ? req.query.typer.split(',') : ['R', 'A', 'H']
    };

    // Get top information
    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : await Info.getTopCountries(dbUtils.getSession(req), params);

    const monthly = await International.getMonths(dbUtils.getSession(req), params);

    writeResponse(res, {
      "Monthly": monthly
    });
  }
  catch (e) {
    writeError(res, {
      "API Error": e.message
    })
  }
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