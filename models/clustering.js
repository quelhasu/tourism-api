const Info = require('./info');

/**
 * @namespace Clustering
 */

 /**
 * Finds the number of ingoing and outgoing trips made 
 * between two areas for a given year
 * 
 * @function getTotalByYear
 * @memberof Clustering
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * 
 * @return {Object} Object with the year and number of trips found
 */
exports.getTotalByYear = (session, params) => {
  return Info.getTotByYear(session, params,
    `MATCH (a0:AreaGironde)-[a1:trip{year:{YEAR}}]-(a2:AreaGironde)\
    WHERE a0.${params.NAME} = {REGION} AND a2.${params.NAME} = {REGION}\
    RETURN sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1,\
    sum(case when ((a0) <-[a1]- (a2) ) then a1.nb else 0 end) as NB2`,
    [1, 2]);
}

/**
 * Finds ingoing and outgoing trips made between two areas for a given year
 * 
 * @function getDepValuesByYear
 * @memberof Clustering
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {Number} totReviews - Total number of reviews for the given year
 * @param {Object[]} [prevArray] - Found object array to concatenate different year stat 
 * 
 * @return {Object} Object with the year and percent of users found for a given year
 */
exports.getDepValuesByYear = (session, params, totReviews, prevArray = null) => {
  var regionsYear = prevArray || {};
  return session
    .run(
      'MATCH (a0:AreaGironde)  -[a1:trip{year:{YEAR}}]- (a2:AreaGironde) \
      WHERE a0.name_3 IN {AREAS}\
       AND a2.name_3 IN {AREAS} and a1.nat in {COUNTRIES} {AGES} \
       RETURN a0.name_3 as shape_gid, \
       sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1, \
       sum(case when ((a0) <-[a1]- (a2) ) then a1.nb else 0 end) as NB2 \
       order by (NB1+NB2) desc'.replace(/{AGES}/g, params.AGES), params)
    .then(result => {
      result.records.forEach(record => {
        shape = record.get("shape_gid");
        !(shape in regionsYear) && (regionsYear[shape] = {});
        !(params.YEAR in regionsYear[shape]) && (regionsYear[shape][params.YEAR] = {});
        regionsYear[shape][params.YEAR]["Ingoing"] = Math.round((10000 * record.get("NB1")) / totReviews["NB1"]) / 100;
        regionsYear[shape][params.YEAR]["Outgoing"] = Math.round((10000 * record.get("NB2")) / totReviews["NB2"]) / 100;
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
 * @memberof Clustering
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
    'MATCH (a0:AreaGironde)  -[a1:trip{year:{YEAR}}]-> (a2:AreaGironde) \
    WHERE a0.name_3 in {AREAS} and a1.nat in {COUNTRIES} {AGES} \
    RETURN a0.name_3 as name, a1.month as month, sum(a1.nb) as NB \
    order by NB desc',
    'Ingoing', 'name')
    .then(result => {
      return Info.getMonthsValues(
        session,
        params,
        'MATCH (a0:AreaGironde)  <-[a1:trip{year:{YEAR}}]- (a2:AreaGironde) \
        WHERE a0.name_3 in {AREAS} and a1.nat in {COUNTRIES} {AGES} \
        RETURN a0.name_3 as name, a1.month as month, sum(a1.nb) as NB \
        order by NB desc',
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
 * @memberof Clustering
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
    `CALL algo.pageRank.stream(\'MATCH (a:AreaGironde) \
    where a.${paramsCopy.NAME} = \\\'${paramsCopy.REGION}\\\' RETURN  id(a) as id\', \'\
    MATCH (a0:AreaGironde)-[a1:trip{year:${paramsCopy.YEAR}}]->(a2:AreaGironde) \
    where a0.name_3 in ${paramsCopy.AREAS} and a2.name_3 in ${paramsCopy.AREAS} and a1.nat in ${paramsCopy.COUNTRIES} ${paramsCopy.AGES == "" ? "" : paramsCopy.AGES.replace(/'/g, '"')} \
    RETURN id(a0) as source, id(a2) as target, sum(toFloat(a1.nb)) as weight\', {graph:\'cypher\', \
    dampingFactor:0.85, iterations:50, write: true, weightProperty:\'weight\'} ) \
    YIELD node, score RETURN node.name_3 AS shape_gid, sum(score) as score ORDER BY score DESC LIMIT 10;`,
    'shape_gid',
    array
  );
};