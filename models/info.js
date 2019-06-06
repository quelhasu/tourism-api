/**
 * @namespace Info
 */


 /**
* Finds all touristic and its number of trips for all trip for a given year
* 
* @function getTopTouristic
* @memberof Info
* 
* @param {Object} sessions - Neo4j context session
* @param {Object} params - Query's parameters
* 
* @return {String[]} Array with all touristic areas found
*/
exports.getTopTouristic = (session, params) => new Promise((resolve, reject) => {
  var topTouristics   = [];
  session
    .run('MATCH (a1:Area_4{name_0:"France"})-[v:trip{year:{YEAR}}]-> \
    (a2:Area_4{name_2:"Gironde" ,name_1:"Nouvelle-Aquitaine", name_0:"France"}) \
    WHERE exists(a1.name_touri)  and a1.name_touri is not null \
    RETURN a1.name_touri as touri, \
    sum(v.nb) as NB order by NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topTouristics.push(record.get("touri"));
      });
      resolve(topTouristics);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

 /**
* Finds all bourough and its number of trips for all trip between 
* France and Nouvelle-Aquitaine - France for a given year 
* 
* @function getTopBoroughs
* @memberof Info
* 
* @param {Object} sessions - Neo4j context session
* @param {Object} params - Query's parameters
* 
* @return {String[]} Array with all boroughs found
*/
exports.getTopBoroughs = (session, params) => new Promise((resolve, reject) => {
  var topBoroughs   = [];
  session
    .run('MATCH (a1:Area_3{name_0:"France"})-[v:trip{year:{YEAR}}]-> \
    (a2:Area_3{name_2:"Gironde" ,name_1:"Nouvelle-Aquitaine", name_0:"France"}) \
    RETURN a1.name as borough, \
    sum(v.nb) as NB order by NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topBoroughs.push(record.get("borough"));
      });
      resolve(topBoroughs);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

 /**
* Finds all districs and its number of trips for all trip between 
* France and Nouvelle-Aquitaine - France for a given year 
* 
* @function getTopDistricts
* @memberof Info
* 
* @param {Object} sessions - Neo4j context session
* @param {Object} params - Query's parameters
* 
* @return {String[]} Array with all boroughs found
*/
exports.getTopDistricts = (session, params) => new Promise((resolve, reject) => {
  var topDistricts  = [];
  session
    .run('MATCH (a1:Area_4{name_0:"France"})-[v:trip{year:{YEAR}}]-> \
    (a2:Area_4{name_3:"Bordeaux", name_2:"Gironde" ,name_1:"Nouvelle-Aquitaine", name_0:"France"}) \
    RETURN a1.name as district, \
    sum(v.nb) as NB order by NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topDistricts.push(record.get("district"));
      });
      resolve(topDistricts);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

/**
* Finds all departments and its number of trips for all trip between 
* France and Nouvelle-Aquitaine - France for a given year 
* 
* @function getTopRegions
* @memberof Info
* 
* @param {Object} sessions - Neo4j context session
* @param {Object} params - Query's parameters
* 
* @return {String[]} Array with all regions found
*/
exports.getTopDepartments = (session, params) => new Promise((resolve, reject) => {
  var topDepartments = [];
  session
    .run('MATCH (a1:Area_2{name_0:"France"})-[v:trip{year:{YEAR}}]-> \
    (a2:Area_2{name_1:"Nouvelle-Aquitaine", name_0:"France"}) \
    RETURN a1.name as department, \
    sum(v.nb) as NB order by NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topDepartments.push(record.get("department"));
      });
      resolve(topDepartments);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

/**
* Finds all regions and its number of trips for all trip between France and 
* Aquitaine - France for a given year 
* 
* @function getTopRegions
* @memberof Info
* 
* @param {Object} sessions - Neo4j context session
* @param {Object} params - Query's parameters
* 
* @return {String[]} Array with all regions found
*/
exports.getTopRegions = (session, params) => new Promise((resolve, reject) => {
  var topRegions = [];
  session
    .run('MATCH (a1:Area_1{country:"France"})-[v:trip{year:{YEAR}}]-> \
    (a2:Area_1{name:"Nouvelle-Aquitaine", country:"France"}) \
    RETURN a1.name as region, \
    sum(v.nb) as NB order by NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topRegions.push(record.get("region"));
      });
      resolve(topRegions);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

/**
* Finds all areas and its number of trips for all trip between two areas
* for a given year and region
* 
* @function getTopAreas
* @memberof Info
* 
* @param {Object} sessions - Neo4j context session
* @param {Object} params - Query's parameters
* 
* @return {String[]} Array with all areas found
*/
exports.getTopAreas = (session, params) => new Promise((resolve, reject) => {
  var topRegions = [];
  session
    .run(`MATCH (a0:Area_4)-[a1:trip{year:{YEAR}}]->(a2:Area_4) \
    WHERE a0.${params.NAME} = {REGION} AND a2.${params.NAME} = {REGION}\
    RETURN a0.name_3 as shape, sum(a1.nb) as NB \
    order by NB desc LIMIT {TOP}`, params)
    .then(result => {
      result.records.forEach(record => {
        topRegions.push(record.get('shape'));
      });
      session.close();
      resolve(topRegions);
    })
    .catch(error => {
      session.close();
      console.log("Erreur : " + error);
      reject(error);
    })
})

/**
* Finds all countries and its number of users that reviewed a 
* location in Aquitaine - France for a given year 
* 
* @function getTopCountries
* @memberof Info
* 
* @param {Object} sessions - Neo4j context session
* @param {Object} params - Query's parameters
* 
* @return {String[]} Array with all countries found
*/
exports.getTopCountries = (session, params) => new Promise((resolve, reject) => {
  var topCountries = [];
  session
    .run('MATCH (a1:User)-[v:review{year:{YEAR}}]->\
    (a2:Location{name_1:"Nouvelle-Aquitaine", name_0:"France"}) \
    RETURN a1.country as country, \
    count(*) as NB order by  NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topCountries.push(record.get("country"));
      });
      resolve(topCountries);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

/**
* Finds all age ranges available
* 
* @function getAgeRanges
* @memberof Info
* 
* @param {Object} sessions - Neo4j context session
* 
* @return {String[]} Array with all age ranges found
*/
exports.getAgeRanges = (session) => new Promise(async (resolve, reject) => {
  var topAges = [];
  session
    .run('MATCH (a:User) return distinct a.age as age order by age')
    .then(result => {
      result.records.forEach(record => {
        topAges.push(record.get("age"));
      })
      resolve(topAges);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

/**
 * Query process to create object with month evolution for each aim value 
 * (e.g regions, countries...)
 * 
 * @function getMonthsValues
 * @memberof Info
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {String} q - Query to process
 * @param {String} going - Ingoing or Outgoing key to process
 * @param {String} aim - Aim value to find
 * @param {Object[]} [array] - Found object array to concatenate different year stat 
 * 
 * @return {String[]} Object with each region and number of reviews by month
 */
exports.getMonthsValues = (session, params, q, going, aim, array = null) => new Promise(async (resolve, reject) => {
  cmvalues = array || {};
  session
    .run(q.replace(/{AGES}/g, params.AGES), params)
    .then(result => {
      result.records.forEach(record => {
        recordVar = record.get(aim);
        month = record.get("month");
        !(recordVar in cmvalues) && (cmvalues[recordVar] = {});
        !(going in cmvalues[recordVar]) && (cmvalues[recordVar][going] = { "months": [] })
        cmvalues[recordVar][going].months[month - 1] = record.get("NB");
      });
      session.close();
      resolve(cmvalues);
    })
    .catch(err => {
      session.close();
      reject(err);
    });
})

/* 
When session is closed driver sends a reset command to the database. 
This causes it to terminate ongoing transaction
*/

/**
 * Query process to get total number of reviews for a given year
 * 
 * @function getTotByYear
 * @memberof Info
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {String} q - Query to proces
 * @param {Array} nbArgs - Array of number to represent type of value to find (e.g. ingoing/outgoing)
 * 
 * @return {Object} Object with year and its number value
 */
exports.getTotByYear = (session, params, q, nbArgs) => new Promise(async (resolve, reject) => {
  try {
    console.log(params);
    nbTot = {}
    session
      .run(q, params)
      .then(result => {
        result.records.forEach(record => {
          nbArgs.forEach(i => {
            nbTot['NB' + i] = record.get("NB" + i).low;
          })
        })
        nbTot['Year'] = params.YEAR;
        session.close();
        resolve(nbTot);
      })
      .catch(err => {
        session.close();
        console.log("Erreur : " + err);
        reject(err);
      })
  }
  catch (e) { throw e }
})

/**
 *  Page rank process according a given query
 * 
 * @function getPageRank
 * @memberof Info
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {String} q - Query to process
 * @param {String} arg - key to find in the database (e.g. regions, countries)
 * @param {Object[]} [array] - Found object array to concatenate different year stat
 *  
 * @return {Object} Object with each arg and its score value
 */
exports.getPageRank = (session, params, q, arg, array = null) => new Promise(async (resolve, reject) => {
  object = array || {}
  session
    .run(q, params)
    .then(result => {
      result.records.forEach(record => {
        var region = record.get(arg)
        !(region in object) && (object[region] = {});
        !(params.YEAR in object[region]) && (object[region][params.YEAR] = {});
        object[region][params.YEAR]['value'] = record.get("score").roundDecimal(2);
      })
      session.close();
      resolve(object);
    })
    .catch(err => {
      session.close();
      console.log("Erreur : " + err);
      reject(err);
    })
})