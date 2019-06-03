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
    AGES: Updater.ages(req.query.ages),
    COUNTRIES: Object.keys(req.query).includes('departments') ? req.query.countries.split(',') : 'France',
    DEPARTMENTS: Object.keys(req.query).includes('countries') ? req.query.departments.split(',') : 'Gironde'
  };
  
  // Monthly evolution
  const monthly = await National.getMonths(dbUtils.getSession(req), params);

  // Centrality
  const centralityArray = await National.getRegionsPageRank(dbUtils.getSession(req), params);

  // Year
  const totReviews = await National.getTotalByYear(dbUtils.getSession(req), params);
  National.getDepartmentsGoingValues(dbUtils.getSession(req), params, totReviews).then(async yearArray => {
      // Year - 1
      const totReviewsOld = await National.getTotalByYear(dbUtils.getSession(req), { YEAR: params.YEAR - 1 });
      National.getTotalByYear(dbUtils.getSession(req), { YEAR: params.YEAR - 1 })
        params.YEAR -= 1;
        National.getDepartmentsGoingValues(dbUtils.getSession(req), params, totReviewsOld, yearArray)
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
      Info.getTopDepartments(session, params),
      Info.getTopCountries(session, params),
      Info.getAgeRanges(session, params),
    ])
    .then(([topDepartments, topCountries, topAges]) => {
      session.close();
      topDepartments.push('Nouvelle-Aquitaine');
      resolve({
        "topDepartments": topDepartments,
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