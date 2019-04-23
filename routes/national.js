var express = require('express');
var router = express.Router({ mergeParams: true });
var writeResponse = require('../helpers/response').writeResponse
const Updater = require('../helpers/update');
var dbUtils = require('../neo4j/dbUtils');
var Info = require("../models/info");
var National = require("../models/national");

router.get("/", (req, res, next) => {
  res.send("hey");
});

router.get("/:year/", async (req, res, next) => {
  var tops = null;
  params = {
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 10,
    AGES: Updater.ages(req.query.ages)
  };

  if (['regions', 'countries'].some(q => !Object.keys(req.query).includes(q))) tops = await getNationalInfo(req);
  params['REGIONS'] = Object.keys(req.query).includes('regions') ? req.query.regions.split(',') : tops['topRegions'];
  params['COUNTRIES'] = Object.keys(req.query).includes('countries') ? req.query.countries.split(',') : tops['topCountries'];

  // Monthly evolution
  const monthly = await National.getMonths(dbUtils.getSession(req), params);
  
  // Year
  const totReviews = await National.getTotalByYear(dbUtils.getSession(req), params);
  National.getRegionsValuesByYear(dbUtils.getSession(req), params, totReviews).then(yearArray => {
      // Year - 1
      National.getTotalByYear(dbUtils.getSession(req), { YEAR: params.YEAR - 1 })
        .then(totReviewsOld => {
          params.YEAR -= 1;
          return National.getRegionsValuesByYear(dbUtils.getSession(req), params, totReviewsOld, yearArray)
        })
        .then(finalArray => {
          writeResponse(res, {
            'TotalReviews': totReviews,
            'Evolution': Updater.diffGoing(finalArray),
            'Monthly': monthly
          })
        })
    });
});


router.get("/:year/info", (req, res, next) => {
  params = {
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 20
  };
  getNationalInfo(req).then(tops => writeResponse(res, tops));
});

const getNationalInfo = (req) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      Info.getTopRegions(dbUtils.getSession(req), params),
      Info.getTopCountries(dbUtils.getSession(req), params),
      Info.getAgeRanges(dbUtils.getSession(req)),
    ])
    .then(([topRegions, topCountries, topAges]) => {
      resolve({
        "topRegions": topRegions,
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