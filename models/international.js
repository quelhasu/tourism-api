const Info = require('./info');

exports.getTotalByYear = (session, params) => {
  return Info.getTotByYear(session, params,
    'MATCH (a1:User)-[v:review{year:{YEAR}}]->\
    (a2:Location{region:"Aquitaine", country:"France"}) \
    where a1.country in {COUNTRIES} {AGES} \
    RETURN count(*) as NB1'.replace(/{AGES}/g, params.AGES),
    [1]);
}

exports.getCountriesValuesByYear = (session, params, totReviews, prevArray = null) => {
  var coutriesYear = prevArray || {};
  return session
    .run(
      'MATCH (a1:User)-[v:review{year:{YEAR}}]->\
      (a2:Location{region:"Aquitaine", country:"France"}) \
      where a1.country in {COUNTRIES} {AGES} and a2.typeR IN {TYPER} \
      RETURN a1.country as country, count(*) as NB1 \
      order by NB1 desc'.replace(/{AGES}/g, params.AGES), params)
    .then(result => {
      result.records.forEach(record => {
        country = record.get("country");
        !(country in coutriesYear) && (coutriesYear[country] = {});
        !(params.YEAR in coutriesYear[country]) && (coutriesYear[country][params.YEAR] = {});
        coutriesYear[country][params.YEAR]['value'] = Math.round((10000 * record.get("NB1")) / totReviews["NB1"]) / 100;
      });
      session.close();
      return coutriesYear;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    });
}

exports.getMonths = (session, params) => {
  return Info.getMonthsValues(
    session,
    params,
    'MATCH (a1:User)-[v:review{year:{YEAR}}]->\
    (a2:Location{region:"Aquitaine", country:"France"}) \
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