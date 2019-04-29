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
  // params['REGIONS'].push("Aquitaine");

  // Monthly evolution
  const monthly = await National.getMonths(dbUtils.getSession(req), params);

  // Centrality
  const centralityArray = await National.getRegionsPageRank(dbUtils.getSession(req), params);

  // Year
  const totReviews = await National.getTotalByYear(dbUtils.getSession(req), params);
  National.getRegionsValuesByYear(dbUtils.getSession(req), params, totReviews).then(async yearArray => {
      // Year - 1
      const totReviewsOld = await National.getTotalByYear(dbUtils.getSession(req), { YEAR: params.YEAR - 1 });
      National.getTotalByYear(dbUtils.getSession(req), { YEAR: params.YEAR - 1 })
        params.YEAR -= 1;
        National.getRegionsValuesByYear(dbUtils.getSession(req), params, totReviewsOld, yearArray)
        .then(async finalArray => {
          const centralityFinalArray = await National.getRegionsPageRank(dbUtils.getSession(req), params, centralityArray);
          writeResponse(res, {
            'Centrality': Updater.diff(centralityFinalArray),
            'TotalReviews': {[params.YEAR +1]: totReviews, [params.YEAR]: totReviewsOld, diff: Updater.percentDiff(totReviewsOld, totReviews, [1,2])},
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
  const session = dbUtils.getSession(req);
  return new Promise((resolve, reject) => {
    Promise.all([
      Info.getTopRegions(session, params),
      Info.getTopCountries(session, params),
      Info.getAgeRanges(session, params),
    ])
    .then(([topRegions, topCountries, topAges]) => {
      session.close();
      topRegions.push('Aquitaine');
      resolve({
        "topRegions": topRegions,
        "topCountries": topCountries,
        "topAges": topAges,
      })
    })
    .catch(err => {
      session.close();
      console.log(err);
      reject(err);
    })
  })
}

module.exports = router;