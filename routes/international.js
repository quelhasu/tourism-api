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
  let yearArr = [];
  let evolution = {};
  let reviewsArr = {};
  let reviews = null;
  let prevArray = null;

  params = {
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 10,
    AGES: Updater.ages(req.query.ages),
  };

  const tops = await getInternationalInfo(req);
  params['COUNTRIES'] = Object.keys(req.query).includes('countries') ? req.query.countries.split(',') : tops['topCountries'];
  params['TYPER'] = Object.keys(req.query).includes('typer') ? req.query.typer.split(',') : ['R', 'A', 'H'];


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
  reviewsArr['diff'] = Updater.percentDiff(reviewsArr[selectedYear-1], reviewsArr[selectedYear])


  writeResponse(res, {
    "TotalReviews": reviewsArr,
    "Evolution": Updater.diff(evolution),
    "Monthly": monthly
  });
  // // Monthly evolution
  // const monthly = await International.getMonths(dbUtils.getSession(req), params);

  // // YEAR
  // const totReviews = await International.getTotalByYear(dbUtils.getSession(req), params);
  // International.getCountriesValuesByYear(dbUtils.getSession(req), params, totReviews).then(async values => {
  //   // YEAR - 1
  //   params['YEAR'] = params.YEAR - 1;
  //   const oldTotReviews = await International.getTotalByYear(dbUtils.getSession(req), params);
  //   International.getCountriesValuesByYear(dbUtils.getSession(req), params, oldTotReviews, values).then(finalArray => {
  //     writeResponse(res, {
  //       "TotalReviews": {[params.YEAR +1]: totReviews, [params.YEAR]: oldTotReviews, diff: Updater.percentDiff(oldTotReviews, totReviews)},
  //       "Evolution": Updater.diff(finalArray),
  //       "Monthly": monthly
  //     });
  //   })
  // })
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