var express = require('express');
var router = express.Router({ mergeParams: true });
var writeResponse = require('../helpers/response').writeResponse
var writeError = require('../helpers/response').writeError
const Updater = require('../helpers/update');
var dbUtils = require('../neo4j/dbUtils');
var Info = require("../models/info");
var National = require("../models/national");

router.get("/", (req, res, next) => {
  res.send("hey");
});

router.get("/:year/annual", async (req, res, next) => {
  try {
    let evolution = {};
    let totalValues = null;

    // Parameters definition
    params = {
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 10,
      AGES: Updater.ages(req.query.ages)
    };


    // Get top information
    const topAges = await Info.getAgeRanges(dbUtils.getSession(req));
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);
    const topDepartments = await Info.getTopDepartments(dbUtils.getSession(req), params);

    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : topCountries;
    params.DEPARTMENTS = req.query.departments ? req.query.departments.split(',') : topDepartments;

    // Monthly evolution

    let selectedYear = params['YEAR'];

    // Year array [selectedYear...selectedYear-3]
    params.YEARS = Updater.yearArray(params['YEAR'], params['YEAR'] - 2);
    totalValues = await National.getTotalByYear(dbUtils.getSession(req), params);
    totalValues['diff'] = Updater.percentDiff(totalValues[selectedYear - 1], totalValues[selectedYear])

    evolution = await National.getDepartmentsGoingValues(dbUtils.getSession(req), params, totalValues);
    
    // Write response
    writeResponse(res, {
      'TotalReviews': totalValues,
      'Evolution': Updater.diffGoing(evolution),
      "TopInfo": {
        "topCountries": topCountries,
        "topAges": topAges,
        "topDepartments": topDepartments
      }
    })
  } catch (e) {
    writeError(res, {
      "API Error": e.message
    })
  }
});

router.get("/:year/monthly", async (req, res, next) => {
  try {
    // Parameters definition
    params = {
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 10,
      AGES: Updater.ages(req.query.ages)
    };

    // Get top information
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);
    const topDepartments = await Info.getTopDepartments(dbUtils.getSession(req), params);

    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : topCountries;
    params.DEPARTMENTS = req.query.departments ? req.query.departments.split(',') : topDepartments;

    // Monthly evolution
    const monthly = await National.getMonths(dbUtils.getSession(req), params);

    // Write response
    writeResponse(res, {
      'Monthly': monthly
    })
  } catch (e) {
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

router.get("/:year/centrality", async (req, res, next) => {
  try {
    let evolution = {};
    let centrality = {};
    let totalValues = null;
    let prevArray = null;

    // Parameters definition
    params = {
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 10,
      AGES: Updater.ages(req.query.ages)
    };

    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : await Info.getTopCountries(dbUtils.getSession(req), params)
    params.DEPARTMENTS = req.query.departments ? req.query.departments.split(',') :  await Info.getTopDepartments(dbUtils.getSession(req), params)
    // Monthly evolution
    // const monthly = await National.getMonths(dbUtils.getSession(req), params);

    // Year array [selectedYear...selectedYear-3]
    params.YEARS = Updater.yearArray(params['YEAR'], params['YEAR'] - 2);

    // All evolution over the years
    for(const year of params.YEARS){
      params['YEAR'] = year;
      centrality = await National.getDepartmentsPageRank(dbUtils.getSession(req), params, prevArray);
      prevArray = await Object.assign({}, centrality);
    }

    // Write response
    writeResponse(res, {
      'Centrality': Updater.diff(centrality)
    })
  } catch (e) {
    writeError(res, {
      "API Error": e.message
    })
  }
});

module.exports = router;

