var express = require('express');
var router = express.Router({ mergeParams: true });
var writeResponse = require('../helpers/response').writeResponse
var writeError = require('../helpers/response').writeError
const Updater = require('../helpers/update');
var dbUtils = require('../neo4j/dbUtils');
var Info = require("../models/info");
var Destination = require("../models/destination");


router.get("/", (req, res, next) => {
  res.send("hey");
});

router.get("/:year/:from/:groupby", async (req, res, next) => {

  if (Updater.verifyNames(req.params.from, req.params.groupby)) {
    let yearArr = [];
    let evolution = {};
    let totalValuesArr = {};
    let totalValues = null;
    let prevArray = null;

    // Parameters definition
    params = {
      FROM: req.params.from.nameQueryFrom(),
      GROUPBY: Number(req.params.groupby),
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 12,
      AGES: Updater.ages(req.query.ages),
      COUNTRIES: 'France',
    };
    

    // Get top information for groupby
    const topAges = await Info.getAgeRanges(dbUtils.getSession(req));
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);
    switch (params.GROUPBY) {
      case 0:
        params.AREAS = await Info.getTopCountries(dbUtils.getSession(req), params);
        break;
      case 1:
        params.AREAS = await Info.getTopRegions(dbUtils.getSession(req), params);
        break;
      case 2:
        params.AREAS = await Info.getTopDepartments(dbUtils.getSession(req), params);
        break;
      case 3:
        params.AREAS = await Info.getTopBoroughs(dbUtils.getSession(req), params);
        break;
      case 4:
        params.AREAS = await Info.getTopDistricts(dbUtils.getSession(req), params);
        break;
      default:
        break;
    }

    const monthly = await Destination.getMonths(dbUtils.getSession(req), params);

    let selectedYear = params['YEAR'];

    // Year array [selectedYear...selectedYear-3]
    yearArr = Updater.yearArray(params['YEAR'], params['YEAR'] - 3);

    // All evolution over the years
    for (const year of yearArr) {
      params['YEAR'] = year;
      totalValues = await Destination.getTotalByYear(dbUtils.getSession(req), params);
      totalValuesArr[year] = totalValues;

      evolution = await Destination.getGoingValues(dbUtils.getSession(req), params, totalValues, prevArray);
      console.log(evolution);
      prevArray = await Object.assign({}, evolution);
    }

    // diff percentage between the last two years
    totalValuesArr['diff'] = Updater.percentDiff(totalValuesArr[selectedYear - 1], totalValuesArr[selectedYear])


    // Write response
    writeResponse(res, {
      'TotalReviews': totalValuesArr,
      'Evolution': evolution,
      'Monthly': monthly,
      "TopInfo": {
        "topCountries": topCountries,
        "topAges": topAges,
        "topAreas": params.AREAS
      }
    })
  }
  else {
    writeError(res, {
      "error": `not possible to combine from name_${req.params.from} with groupby name_${req.params.groupby}`
    })
  }
});



router.get("/:year/:from/:groupby/info", async (req, res, next) => {
  if (Updater.verifyNames(req.params.from, req.params.groupby)) {

    // Parameters definition
    params = {
      FROM: req.params.from.nameQueryFrom(),
      GROUPBY: Number(req.params.groupby),
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 12,
      AGES: Updater.ages(req.query.ages),
      COUNTRIES: 'France',
    };

    const topAges = await Info.getAgeRanges(dbUtils.getSession(req));
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);
    let topAreas = null;
    switch (params.GROUPBY) {
      case 0:
        topAreas = await Info.getTopCountries(dbUtils.getSession(req), params);
        break;
      case 1:
        topAreas = await Info.getTopRegions(dbUtils.getSession(req), params);
        break;
      case 2:
       topAreas = await Info.getTopDepartments(dbUtils.getSession(req), params);
        break;
      case 3:
        topAreas = await Info.getTopBoroughs(dbUtils.getSession(req), params);
        break;
      case 4:
        topAreas = await Info.getTopDistricts(dbUtils.getSession(req), params);
        break;
      default:
        break;
    }

      writeResponse(res, {
        "topCountries": topCountries,
        "topAges": topAges,
        "topAreas": topAreas
      });
  }
  else {
    writeError(res, {
      "error": `not possible to combine from name_${req.params.from} with groupby name_${req.params.groupby}`
    })
  }
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