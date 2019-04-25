var express = require('express');
var router = express.Router({ mergeParams: true });
var writeResponse = require('../helpers/response').writeResponse
const Updater = require('../helpers/update');
var dbUtils = require('../neo4j/dbUtils');
var Info = require("../models/info");
var Clustering = require("../models/clustering");


router.get("/", (req, res, next) => {
  res.send("hey");
});

router.get("/:year/:name/:region", async (req, res, next) => {
  params = {
    REGION: req.params.region.capitalize(),
    NAME: req.params.name.nameQuery(),
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 10,
    AGES: Updater.ages(req.query.ages)
  };

  const tops = await getGroupingInfo(req);
  params['AREAS'] = Object.keys(req.query).includes('areas') ? req.query.areas.split(',') : tops['topAreas'];
  params['COUNTRIES'] = Object.keys(req.query).includes('countries') ? req.query.countries.split(',') : tops['topCountries'];

  // Monthly evolution
  const monthly = await Clustering.getMonths(dbUtils.getSession(req), params);

  // Centrality
  const centralityArray = await Clustering.getAreasPageRank(dbUtils.getSession(req), params);

  // YEAR
  const totReviews = await Clustering.getTotalByYear(dbUtils.getSession(req), params);
  Clustering.getDepValuesByYear(dbUtils.getSession(req), params, totReviews)
    .then(async resp => {
      params.YEAR -= 1;
      const oldTotReviews = await Clustering.getTotalByYear(dbUtils.getSession(req), params);
      Clustering.getDepValuesByYear(dbUtils.getSession(req), params, oldTotReviews, resp)
        .then(async finalArray=>{
          const centralityFinalArray = await Clustering.getAreasPageRank(dbUtils.getSession(req), params, centralityArray);
          writeResponse(res, {
            'Centrality': Updater.diff(centralityFinalArray),
            'TotalReviews': totReviews,
            "Evolution": Updater.diffGoing(finalArray),
            "Monthly": monthly
          });
        })
    })
});



router.get("/:year/:name/:region/info", (req, res, next) => {
  params = {
    REGION: req.params.region.capitalize(),
    NAME: req.params.name.nameQuery(),
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 20
  };
  getGroupingInfo(req).then(tops => writeResponse(res, tops));
});

const getGroupingInfo = (req) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      Info.getTopCountries(dbUtils.getSession(req), params),
      Info.getTopAreas(dbUtils.getSession(req), params),
      Info.getAgeRanges(dbUtils.getSession(req)),
    ])
    .then(([topCountries, topAreas, topAges]) => {
      resolve({
        "topAreas": topAreas,
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