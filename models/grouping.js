const Info = require('./info');

exports.getTotalByYear = (session, params) => {
  return Info.getTotByYear(session, params,
    `MATCH (a0:AreaGironde)-[a1:trip{year:{YEAR}}]-(a2:AreaGironde)\
    WHERE a0.${params.NAME} = {REGION} AND a2.${params.NAME} = {REGION}\
    RETURN sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1,\
    sum(case when ((a0) <-[a1]- (a2) ) then a1.nb else 0 end) as NB2`,
    [1, 2]);
}

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
        regionsYear[shape][params.YEAR]["Outgoing"] = Math.round((10000 * record.get("NB2")) / totReviews["NB1"]) / 100;
      });
      session.close();
      return regionsYear;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    });
};

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