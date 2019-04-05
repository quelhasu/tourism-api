var express = require('express');
var router = express.Router({ mergeParams: true });
var writeResponse = require('../helpers/response').writeResponse
var update = require('../helpers/update');
var dbUtils = require('../neo4j/dbUtils');
var Info = require("../models/info");
var National = require("../models/national");

router.get("/", (req, res, next) => {
  res.send("hey");
});

router.get("/:year/", (req, res, next) => {
  params = {
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 20,
    REGIONS: req.query.regions.split(','),
    COUNTRIES: req.query.countries.split(','),
    AGES: update.ages(req.query.ages)
  };

  // Year
  Info.getTotNationalByYear(dbUtils.getSession(req), params)
    .then(totReviews => {
      return National.getRegionsValuesByYear(dbUtils.getSession(req), params, totReviews)
    })
    .then(yearArray => {
      // Year - 1
      Info.getTotNationalByYear(dbUtils.getSession(req), { YEAR: params.YEAR - 1 })
        .then(totReviewsOld => {
          params.YEAR -= 1;
          return National.getRegionsValuesByYear(dbUtils.getSession(req), params, totReviewsOld, yearArray)
        })
        .then(finalArray => {
          writeResponse(res, diff(finalArray));
        })
    })
});

const diff = (array) => {
  for(var region in array){
    for(var year in array[region]){
      array[region]['diff'] = {
        'Ingoing':  array[region][eval(year) + 1]['Ingoing'] - array[region][year]['Ingoing'],
        'Outgoing': array[region][eval(year) + 1]['Outgoing'] - array[region][year]['Outgoing']
      }
      break;
    }
  }
  return array;
}

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