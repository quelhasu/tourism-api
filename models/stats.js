const Updater = require("../helpers/update");

/**
 * @namespace Stats
 */

/**
 * Finds number users that reviewed something until 2010
 * @function getDatabaseStats
 * @memberof Stats
 * 
 * @param {Object} sessions - Neo4j context session
 * 
 * @return {Object} Object with different statistics (number of users/reviews ...)
 */
exports.getDatabaseStats = (session) => {
  vYears = {};
  return session
    .run('MATCH (u:User)-[v:review]->() WHERE v.year >= 2010 RETURN v.year AS YEAR, count(*) as NB, count(distinct u.id) AS NBU')
    .then(function (result) {
      result.records.forEach(record => {
        y = record.get("YEAR").low;
        vYears[y] = {
          "year": y,
          "users": Updater.formatNumber(record.get("NBU")),
          "?": 0,
          "reviews": Updater.formatNumber(record.get("NB"))
        };
      });
      session.close();
      return vYears;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    })
}

/**
 * Finds users that reviews something for a given year and a specific country
 * @function getDatabaseCountryStats
 * @memberof Stats
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {Object[]} [vYears] - Found object array to concatenate different year stat 
 * 
 * @return {Object} Object with the year and number of users found
 */
exports.getDatabaseCountryStats = (session, params, vYears) => {
  var vYears = vYears || {};
  return session
    .run('MATCH (u:User)-[v:review]->() WHERE u.country = {COUNTRY} AND v.year >= 2010 RETURN v.year AS YEAR, count(distinct u.id) AS NB', params)
    .then(result =>{
      result.records.forEach(record=>{
        y = record.get("YEAR").low;
        !(y in vYears) && (vYears[y]={})
        vYears[y][params.COUNTRY] = Updater.formatNumber(record.get("NB"));
      })
      session.close();
      return vYears;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      throw {username: 'This field is required.', status: 400};
    })
}

/**
 * Finds users that reviews something for a given year and a specific department
 * @function getDatabaseDepStats
 * @memberof Stats
 * 
 * @param {Object} sessions - Neo4j context session
 * @param {Object} params - Query's parameters
 * @param {Object[]} [vYears] - Found object array to concatenate different year stat 
 * 
 * @return {Object} Object with the year and number of users found
 */
exports.getDatabaseDepStats = (session, params, vYears) => {
  var vYears = vYears || {};
  return session
    .run('MATCH ()-[v:review]->(l:Location{dep:{DEP}}) WHERE v.year >= 2010 RETURN v.year AS YEAR, count(*) AS NB', params)
    .then(result =>{
      result.records.forEach(record=>{
        y = record.get("YEAR").low;
        !(y in vYears) && (vYears[y]={})
        vYears[y][params.DEP] = Updater.formatNumber(record.get("NB"));
      })
      session.close();
      return vYears;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    })
}