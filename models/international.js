const Info = require('./info');

/**
 * @namespace International
 */

/**
 * Finds the number of ingoing and outgoing trips made between countries 
 * in France and areas in Aquitaine for a given year
 * 
 * @function getTotalByYear
 * @memberof International
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * 
 * @return {Object} Object with the year and number of users found
 */
exports.getTotalByYear = (session, params) => {
  return Info.getTotByYear(session, params,
    'MATCH (a1:User)-[v:review]->\
    (a2:Location{gid_1:"FRA.10_1", gid_0:"FRA"}) \
    where a1.country in {COUNTRIES} {AGES} \
    AND v.year IN {YEARS} \
    RETURN v.year as year, count(*) as NB1'.replace(/{AGES}/g, params.AGES),
    [1]);
}

/**
 * Finds the number of users that reviewed a location in 
 * Aquitaine - France per country for a given year
 * 
 * @function getCountriesValuesByYear 
 * @memberof International
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {Number} totReviews - Total number of reviews for the given year
 * @param {Object[]} [prevArray] - Found object array to concatenate different year stat 
 * 
 * @return {Object} Object with the year and number of reviews found
 */
exports.getCountriesValuesByYear = (session, params, totReviews, prevArray = null) => {
  var coutriesYear = prevArray || {};
  return session
    .run(
      'MATCH (a1:User)-[v:review]->\
      (a2:Location{gid_1:"FRA.10_1", gid_0:"FRA"}) \
      where a1.country in {COUNTRIES} {AGES} and a2.typeR IN {TYPER} \
      AND v.year IN {YEARS} \
      RETURN v.year as year, a1.country as country, count(*) as NB1 \
      order by NB1 desc'.replace(/{AGES}/g, params.AGES), params)
    .then(result => {
      result.records.forEach(record => {
        country = record.get("country")
        year = record.get("year")
        !(country in coutriesYear) && (coutriesYear[country] = {});
        !(year in coutriesYear[country]) && (coutriesYear[country][year] = {});
        coutriesYear[country][year]['value'] = Math.round((10000 * record.get("NB1")) / totReviews[year]["NB1"]) / 100;
      });
      session.close();
      return coutriesYear;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    });
}

/**
 * Finds the number of ingoing and outgoing trips made between countries 
 * in France and areas in Aquitaine by month for a given year 
 * 
 * @function getMonths
 * @memberof International
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
    'MATCH (a1:User)-[v:review{year:{YEAR}}]->\
    (a2:Location{gid_1:"FRA.10_1", gid_0:"FRA"}) \
    where a1.country in {COUNTRIES} {AGES} \
    RETURN a1.country as country, v.month as month, count(*) as NB \
    ORDER BY NB DESC',
    'Reviews', 'country')
    .then(final => {
      return final;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    });
};