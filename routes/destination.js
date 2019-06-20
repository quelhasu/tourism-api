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

router.get("/:year/:from/:groupby/annual", async (req, res, next) => {

  if (Updater.verifyNames(req.params.from, req.params.groupby )) {
    let evolution = {};
    let centrality = {};
    let totalValues = null;
    let prevArray = null;

    // Parameters definition
    params = {
      FROM: req.params.from.nameQueryFrom(),
      GROUPBY: Number(req.params.groupby),
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 8,
      TOPAREAS: Number(req.query.limitareas) || 10,
      AGES: Updater.ages(req.query.ages),
      NAME: 'name'
    };

    // Get top information for groupby
    const topAges = await Info.getAgeRanges(dbUtils.getSession(req));
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);
    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : topCountries;

    switch (params.GROUPBY) {
      case 0:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopCountries(dbUtils.getSession(req), params);
        break;
      case 1:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopRegions(dbUtils.getSession(req), params);
        break;
      case 2:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopDepartments(dbUtils.getSession(req), params);
        break;
      case 3:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopBoroughs(dbUtils.getSession(req), params);
        break;
      case 4:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopDistricts(dbUtils.getSession(req), params);
        break;
      case 2.5:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopTouristic(dbUtils.getSession(req), params);
        params.GROUPBY = 4;
        params.NAME = 'name_touri';
        break;
      default:
        break;
    }

    let selectedYear = params['YEAR'];

    // Year array [selectedYear...selectedYear-3]
    // yearArr = Updater.yearArray(params['YEAR'], params['YEAR'] - 2);
    params.YEARS = Updater.yearArray(params['YEAR'], params['YEAR'] - 2);
    totalValues = await Destination.getTotalByYear(dbUtils.getSession(req), params);
    totalValues['diff'] = Updater.percentDiff(totalValues[selectedYear - 1], totalValues[selectedYear])

    evolution = await Destination.getGoingValues(dbUtils.getSession(req), params, totalValues);


    // Write response
    writeResponse(res, {
      'TotalReviews': totalValues,
      'Evolution': Updater.diffGoing(evolution),
      'TopInfo': {
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

router.get("/:year/:from/:groupby/centrality", async (req, res, next) => {

  if (Updater.verifyNames(req.params.from, req.params.groupby)) {
    let centrality = {};
    let prevArray = null;

    // Parameters definition
    params = {
      FROM: req.params.from.nameQueryFrom(),
      GROUPBY: Number(req.params.groupby),
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 8,
      TOPAREAS: Number(req.query.limitareas) || 100,
      AGES: Updater.ages(req.query.ages),
      NAME: 'name'
    };

    // Get top information for groupby
    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : await Info.getTopCountries(dbUtils.getSession(req), params);

    switch (params.GROUPBY) {
      case 0:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopCountries(dbUtils.getSession(req), params);
        break;
      case 1:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopRegions(dbUtils.getSession(req), params);
        break;
      case 2:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopDepartments(dbUtils.getSession(req), params);
        break;
      case 3:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopBoroughs(dbUtils.getSession(req), params);
        break;
      case 4:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopDistricts(dbUtils.getSession(req), params);
        break;
      case 2.5:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopTouristic(dbUtils.getSession(req), params);
        params.GROUPBY = 4;
        params.NAME = 'name_touri';
        break;
      default:
        break;
    }

    let selectedYear = params['YEAR'];

    // Year array [selectedYear...selectedYear-3]
    params.YEARS = Updater.yearArray(params['YEAR'], params['YEAR'] - 2);

    for (const year of params.YEARS) {
      params['YEAR'] = year;
      centrality = await Destination.getAreasPageRank(dbUtils.getSession(req), params, prevArray);
      prevArray = await Object.assign({}, centrality);
    }

    // Write response
    writeResponse(res, {
      'paramsz': params,
      'Centrality': Updater.diff(centrality)
    })
  }
  else {
    writeError(res, {
      "error": `not possible to combine from name_${req.params.from} with groupby name_${req.params.groupby}`
    })
  }
});

router.get("/:year/:from/:groupby/monthly", async (req, res, next) => {

  if (Updater.verifyNames(req.params.from, req.params.groupby)) {
    let yearArr = [];
    let evolution = {};
    let centrality = {};
    let totalValuesArr = {};
    let totalValues = null;
    let prevArray = null;
    let prevArrayCentral = null;

    // Parameters definition
    params = {
      FROM: req.params.from.nameQueryFrom(),
      GROUPBY: Number(req.params.groupby),
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 12,
      AGES: Updater.ages(req.query.ages),
      NAME: 'name'
    };

    // Get top information for groupby
    const topAges = await Info.getAgeRanges(dbUtils.getSession(req));
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);
    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : topCountries;

    if (req.query.areas) {
      params.AREAS = req.query.areas.split(',')
      if (params.GROUPBY == 2.5) {
        params.GROUPBY = 4
        params.NAME = 'name_touri'
      }
    }
    else {
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
        case 2.5:
          params.AREAS = await Info.getTopTouristic(dbUtils.getSession(req), params);
          params.GROUPBY = 4;
          params.NAME = 'name_touri';
          break;
        default:
          break;
      }
    }


    const monthly = await Destination.getMonths(dbUtils.getSession(req), params);

    // Write response
    writeResponse(res, {
      'Monthly': monthly,
    })
  }
  else {
    writeError(res, {
      "error": `not possible to combine from name_${req.params.from} with groupby name_${req.params.groupby}`
    })
  }
});

router.get("/:year/:from/:groupby/info/areas", async (req, res, next) => {
  params = {
    FROM: req.params.from.nameQueryFrom(),
    GROUPBY: Number(req.params.groupby),
    YEAR: Number(req.params.year),
    TOP: Number(req.query.limit) || 100,
    TOPAREAS: Number(req.query.limitareas) || 100
  };

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
    case 2.5:
      params.AREAS = await Info.getTopTouristic(dbUtils.getSession(req), params);
      break;
    default:
      break;
  }

    writeResponse(res, {
      'topAreas': params.AREAS
    })
});


router.get("/:year/:from/:groupby/info", async (req, res, next) => {
  if (Updater.verifyNames(req.params.from, req.params.groupby)) {

    // Parameters definition
    params = {
      FROM: req.params.from.nameQueryFrom(),
      GROUPBY: Number(req.params.groupby),
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 12,
      TOPAREAS: Number(req.query.limitareas) || 10,
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

router.get("/:year/:from/:groupby/centrality", async (req, res, next) => {

  if (Updater.verifyNames(req.params.from, req.params.groupby)) {
    let yearArr = [];
    let evolution = {};
    let centrality = {};
    let totalValuesArr = {};
    let totalValues = null;
    let prevArray = null;
    let prevArrayCentral = null;

    // Parameters definition
    params = {
      FROM: req.params.from.nameQueryFrom(),
      GROUPBY: Number(req.params.groupby),
      YEAR: Number(req.params.year),
      TOP: Number(req.query.limit) || 8,
      TOPAREAS: Number(req.query.limitareas) || 10,
      AGES: Updater.ages(req.query.ages),
      NAME: 'name',
      YEARS: Number(req.query.years) || 2
    };

    // Get top information for groupby
    const topAges = await Info.getAgeRanges(dbUtils.getSession(req));
    const topCountries = await Info.getTopCountries(dbUtils.getSession(req), params);
    params.COUNTRIES = req.query.countries ? req.query.countries.split(',') : topCountries;

    switch (params.GROUPBY) {
      case 0:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopCountries(dbUtils.getSession(req), params);
        break;
      case 1:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopRegions(dbUtils.getSession(req), params);
        break;
      case 2:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopDepartments(dbUtils.getSession(req), params);
        break;
      case 3:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopBoroughs(dbUtils.getSession(req), params);
        break;
      case 4:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopDistricts(dbUtils.getSession(req), params);
        break;
      case 2.5:
        params.AREAS = req.query.areas ? req.query.areas.split(',') : await Info.getTopTouristic(dbUtils.getSession(req), params);
        params.GROUPBY = 4;
        params.NAME = 'name_touri';
        break;
      default:
        break;
    }

    let selectedYear = params['YEAR'];

    // Year array [selectedYear...selectedYear-3]
    // yearArr = Updater.yearArray(params['YEAR'], params['YEAR'] - params.YEARS);
    params.YEARS = Updater.yearArray(params['YEAR'], params['YEAR'] - params.YEARS)

    for (const year of params.YEARS) {
      params['YEAR'] = year;
      centrality = await Destination.getAreasPageRank(dbUtils.getSession(req), params, prevArray);
      prevArray = await Object.assign({}, centrality);
    }

    // // All evolution over the years
    // for (const year of yearArr) {
    //   params['YEAR'] = year;
    //   totalValues = await Destination.getTotalByYear(dbUtils.getSession(req), params);
    //   totalValuesArr[year] = totalValues;


    // prevArray = await Object.assign({}, evolution);

    // prevArrayCentral = await Object.assign({}, centrality);
    // }

    // // diff percentage between the last two years


    // Write response
    writeResponse(res, {
      // 'parasm': params,
      'Centrality': Updater.diff(centrality)
    })
  }
  else {
    writeError(res, {
      "error": `not possible to combine from name_${req.params.from} with groupby name_${req.params.groupby}`
    })
  }
});

module.exports = router;