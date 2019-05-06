const update = require("../helpers/update");
const Info = require("./info");

/**
 * @namespace National
 */

/**
 * Finds ingoing and outgoing trips made between countries 
 * in France and areas in Aquitaine for a given year
 * 
 * @function getRegionsValuesByYear
 * @memberof National
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {Number} totReviews - Total number of reviews for the given year
 * @param {Object[]} [prevArray] - Found object array to concatenate different year stat 
 * 
 * @return {Object} Object with the year and percent of users found for a given year
 */
exports.getRegionsValuesByYear = (session, params, totReviews, prevArray = null) => {
  var regionsYear = prevArray || {};
  return session
    .run(
      'MATCH (a0:Area{country:"France"})  -[a1:trip{year:{YEAR}}]- \
    (a2:Area{name:"Aquitaine"}) \
    where a0.name in {REGIONS} and a1.nat in {COUNTRIES} {AGES} \
    RETURN a0.name as region, \
    sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1, \
    sum(case when ((a0) <-[a1]- (a2) ) then a1.nb else 0 end) as NB2 \
    order by (NB1+NB2) desc'.replace(/{AGES}/g,params.AGES),params)
    .then(result => {
      result.records.forEach(record => {
        region = record.get("region");
        !(region in regionsYear) && (regionsYear[region] = {});
        !(params.YEAR in regionsYear[region]) && (regionsYear[region][params.YEAR] = {});
        regionsYear[region][params.YEAR]["Ingoing"] = Math.round((10000 * record.get("NB1")) / totReviews["NB1"]) / 100;
        regionsYear[region][params.YEAR]["Outgoing"] = Math.round((10000 * record.get("NB2")) / totReviews["NB1"]) / 100;
      });
      session.close();
      return regionsYear;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    });
};

/**
 * Finds the number of ingoing and outgoing trips made between countries 
 * in France and areas in Aquitaine for a given year
 * 
 * @function getTotalByYear
 * @memberof National
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * 
 * @return {Object} Object with the year and number of users found
 */
exports.getTotalByYear = (session, params) => {
  return Info.getTotByYear(session, params,
    'MATCH (a0:Area{country:"France"}) -[a1:trip{year:{YEAR}}]- \
    (a2:Area{name:"Aquitaine"}) \
    RETURN sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1, \
    sum(case when ((a0) <-[a1]- (a2) ) then a1.nb else 0 end) as NB2',
    [1,2]);
};

/**
 * Finds the number of ingoing and outgoing trips made between countries 
 * in France and areas in Aquitaine by month for a given year 
 * 
 * @function getMonths
 * @memberof National
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * 
 * @return {Object} Object with each country and number of reviews by month
 */
exports.getMonths = (session, params) => {
  return Info.getMonthsValues(
    session,
    params,
    'MATCH (a0:Area{country:"France"})  -[a1:trip{year:{YEAR}}]-> \
    (a2:Area{name:"Aquitaine"}) where a0.name in {REGIONS} \
    and a1.nat in {COUNTRIES} {AGES} \
    RETURN a0.name as region, a1.month as month, sum(a1.nb) as NB \
    order by NB desc',
    'Ingoing', 'region')
    .then(result => {
      return Info.getMonthsValues(
        session, 
        params, 
        'MATCH (a0:Area{country:"France"})  <-[a1:trip{year:{YEAR}}]- \
        (a2:Area{name:"Aquitaine"}) where a0.name in {REGIONS} \
        and a1.nat in {COUNTRIES} {AGES} \
        RETURN a0.name as region, a1.month as month, sum(a1.nb) as NB \
        order by NB desc', 
        'Outgoing','region',
        result);
    })
    .then(final => {
      return final;
    })
};

/**
 * Finds page rank score for regions in France
 * 
 * @function getRegionsPageRank
 * @memberof National
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {Object[]} [array] - Found object array to concatenate different year stat 

 * @return {Object} Object with each year and its value page rank
 */
exports.getRegionsPageRank = async (session, params, array=null) => {
  paramsCopy = JSON.parse(JSON.stringify(params));
  ['REGIONS', 'COUNTRIES'].forEach(variable => {
    paramsCopy[variable] = JSON.stringify(paramsCopy[variable]).replace(/'/g, "\\'")
  })
  return Info.getPageRank(
    session,
    paramsCopy,
    `CALL algo.pageRank.stream(\'MATCH (a:Area{country:"France"}) \
    where a.name in ${paramsCopy.REGIONS} RETURN id(a) as id\', \'\
    MATCH (a0:Area{country:"France"})-[a1:trip{year:${paramsCopy.YEAR}}]->(a2:Area{country:"France"}) \
    where a0.name in ${paramsCopy.REGIONS} and a1.nat in ${paramsCopy.COUNTRIES} ${paramsCopy.AGES == "" ? "" : paramsCopy.AGES.replace(/'/g, '"')} \
    RETURN id(a0) as source, id(a2) as target, sum(toFloat(a1.nb)) as weight\', {graph:\'cypher\', \
    dampingFactor:0.85, iterations:50, write: true, weightProperty:\'weight\'} ) \
    YIELD node, score RETURN node.name AS region,score ORDER BY score DESC;`,
    'region',
    array
  );
}