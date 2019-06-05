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

router.get("/:year/", async (req, res, next) => {
  try {
    let yearArr = [];
    let evolution = {};
    let reviewsArr = {};
    let reviews = null;
    let prevArray = null;

    params = {
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 10,
      AGES: Updater.ages(req.query.ages),
      TYPER: req.query.typer ? req.query.typer.split(',') : ['R', 'A', 'H']
    };

    // Get top information
    const topAges = await Info.getAgeRanges(dbUtils.getSession(req));
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);

    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : topCountries;

    const monthly = await International.getMonths(dbUtils.getSession(req), params);

    let selectedYear = params['YEAR'];

    // Year array [selectedYear...selectedYear-3]
    yearArr = Updater.yearArray(params['YEAR'], params['YEAR'] - 3);

    // All evolution over the years
    for (const year of yearArr) {
      params['YEAR'] = year;
      reviews = await International.getTotalByYear(dbUtils.getSession(req), params);
      reviewsArr[year] = reviews;

      evolution = await International.getCountriesValuesByYear(dbUtils.getSession(req), params, reviews, prevArray);
      prevArray = await Object.assign({}, evolution);
    }

    // diff percentage between the last two years
    reviewsArr['diff'] = Updater.percentDiff(reviewsArr[selectedYear - 1], reviewsArr[selectedYear])


    writeResponse(res, {
      "TotalReviews": reviewsArr,
      "Evolution": Updater.diff(evolution),
      "Monthly": monthly,
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