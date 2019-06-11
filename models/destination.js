const Info = require('./info');

/**
 * @namespace Destination
 */

 /**
 * Finds the number of ingoing and outgoing trips made 
 * between two areas for a given year
 * 
 * @function getTotalByYear
 * @memberof Destination
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * 
 * @return {Object} Object with the year and number of trips found
 */
exports.getTotalByYear = (session, params) => {
  return Info.getTotByYear(session, params,
    `MATCH (a0:Area_${params.GROUPBY}) -[a1:trip]-  \
    (a2:Area_${params.GROUPBY}) \
    WHERE a0.${params.FROM} AND a2.${params.FROM} \
    AND a1.year IN {YEARS}
    RETURN a1.year as year, sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1`,
    [1]);
}

/**
 * Finds ingoing and outgoing trips made between two areas for a given year
 * 
 * @function getGoingValues
 * @memberof Destination
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {Number} totReviews - Total number of reviews for the given year
 * @param {Object[]} [prevArray] - Found object array to concatenate different year stat 
 * 
 * @return {Object} Object with the year and percent of users found for a given year
 */
exports.getGoingValues = (session, params, totReviews, prevArray = null) => {
  var regionsYear = prevArray || {};
  return session
    .run(
      `MATCH (a0:Area_${params.GROUPBY}) -[a1:trip]- (a2:Area_${params.GROUPBY}) \
      WHERE a0.${params.FROM} AND a2.${params.FROM} \
      AND a1.year IN {YEARS} \
      AND a0.${params.NAME} IN {AREAS}\
       AND a2.${params.NAME} IN {AREAS} and a1.nat in {COUNTRIES} {AGES} \
       RETURN a1.year as year, a0.${params.NAME} as name, \
       sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1, \
       sum(case when ((a0) <-[a1]- (a2) ) then a1.nb else 0 end) as NB2 \
       order by (NB1+NB2) desc`.replace(/{AGES}/g, params.AGES), params)
    .then(result => {
      result.records.forEach(record => {
        year = record.get("year");
        shape = record.get("name");
        !(shape in regionsYear) && (regionsYear[shape] = {});
        !(year in regionsYear[shape]) && (regionsYear[shape][year] = {});
        regionsYear[shape][year]["Ingoing"] = Math.round((10000 * record.get("NB1")) / totReviews[year]["NB1"]) / 100;
        regionsYear[shape][year]["Outgoing"] = Math.round((10000 * record.get("NB2")) / totReviews[year]["NB1"]) / 100;
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
 * Finds the number of ingoing and outgoing trips made between areas 
 * by month for a given year 
 * 
 * @function getMonths
 * @memberof Destination
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * 
 * @return {Object} Object with each region and number of reviews by month
 */
exports.getMonths = (session, params) => {
  return Info.getMonthsValues(
    session,
    params,
    `MATCH (a0:Area_${params.GROUPBY}) -[a1:trip{year:{YEAR}}]-> (a2:Area_${params.GROUPBY}) \
    WHERE a0.${params.FROM} AND a2.${params.FROM} \
    AND a0.${params.NAME} IN {AREAS}\
     AND a2.${params.NAME} IN {AREAS} and a1.nat in {COUNTRIES} {AGES} \
    RETURN a0.${params.NAME} as name, a1.month as month, sum(a1.nb) as NB \
    order by NB desc`,
    'Ingoing', 'name')
    .then(result => {
      return Info.getMonthsValues(
        session,
        params,
        `MATCH (a0:Area_${params.GROUPBY}) <-[a1:trip{year:{YEAR}}]- (a2:Area_${params.GROUPBY}) \
        WHERE a0.${params.FROM} AND a2.${params.FROM} \
        AND a0.${params.NAME} IN {AREAS}\
         AND a2.${params.NAME} IN {AREAS} and a1.nat in {COUNTRIES} {AGES} \
        RETURN a0.${params.NAME} as name, a1.month as month, sum(a1.nb) as NB \
        order by NB desc`,
        'Outgoing', 'name',
        result);
    })
    .then(final => {
      return final;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    });
};

/**
 * Finds page rank score for areas in France
 * 
 * @function getAreasPageRank
 * @memberof Destination
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {Object[]} [array] - Found object array to concatenate different year stat 

 * @return {Object} Object with each year and its value page rank
 */
exports.getAreasPageRank = async (session, params, array=null) => {
  paramsCopy = JSON.parse(JSON.stringify(params));
  ['AREAS', 'COUNTRIES'].forEach(variable => {
    paramsCopy[variable] = JSON.stringify(paramsCopy[variable]).replace(/'/g, "\\'")
  })
  return Info.getPageRank(
    session,
    paramsCopy,
    `CALL algo.pageRank.stream(\'MATCH (a:Area_${params.GROUPBY}) \
    where a.${params.FROM.replace(/'/g, '"')} and a.${params.NAME} in ${paramsCopy.AREAS} RETURN  id(a) as id\', \'\
    MATCH (a0:Area_${params.GROUPBY})-[a1:trip{year:${paramsCopy.YEAR}}]->(a2:Area_${params.GROUPBY}) \
    where a0.${params.NAME} in ${paramsCopy.AREAS} and a2.${params.NAME} in ${paramsCopy.AREAS} \
    and a0.${params.FROM.replace(/'/g, '"')} and a2.${params.FROM.replace(/'/g, '"')} \
    and a1.nat in ${paramsCopy.COUNTRIES} ${paramsCopy.AGES == "" ? "" : paramsCopy.AGES.replace(/'/g, '"')} \
    RETURN a1.year as year, id(a0) as source, id(a2) as target, sum(toFloat(a1.nb)) as weight\', {graph:\'cypher\', \
    dampingFactor:0.85, iterations:50, write: true, weightProperty:\'weight\'} ) \
    YIELD node, score RETURN node.${params.NAME} AS name, sum(score) as score ORDER BY score DESC LIMIT ${paramsCopy.TOP};`,
    'name',
    array
  );
};