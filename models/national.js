const update = require("../helpers/update");
const Info = require("./info");

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



exports.getTotalByYear = (session, params) => {
  return Info.getTotByYear(session, params,
    'MATCH (a0:Area{country:"France"}) -[a1:trip{year:{YEAR}}]- \
    (a2:Area{name:"Aquitaine"}) \
    RETURN sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1, \
    sum(case when ((a0) <-[a1]- (a2) ) then a1.nb else 0 end) as NB2',
    [1,2]);
}

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