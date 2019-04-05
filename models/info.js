exports.getTopRegions = (session, params) => {
  var topRegions = [];
  return session
    .run('MATCH (a1:Area{country:"France"})-[v:trip{year:{YEAR}}]-> \
    (a2:Area{name:"Aquitaine", country:"France"}) \
    RETURN a1.name as region, \
    sum(v.nb) as NB order by NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topRegions.push(record.get("region"));
      });
      session.close();
      return topRegions;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    })
}

exports.getTopCountries = (session, params) => {
  var topCountries = [];
  return session 
    .run('MATCH (a1:User)-[v:review{year:{YEAR}}]->\
    (a2:Location{region:"Aquitaine", country:"France"}) \
    RETURN a1.country as country, \
    count(*) as NB order by  NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topCountries.push(record.get("country"));
      });
      session.close();
      return topCountries;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    })
}

exports.getAgeRanges = (session) => {
  var topAges = [];
  return session
    .run('MATCH (a:User) return distinct a.age as age \
    order by age')
    .then(result => {
      result.records.forEach(record => {
        topAges.push(record.get("age"));
      })
      session.close();
      return topAges;
    })
    .catch(err => {
      console.log("Erreur : " + err);
      return null;
    })
}

exports.getTotNationalByYear = (session, params) => {
  nbTot = {}
  return session
    .run('MATCH (a0:Area{country:"France"}) -[a1:trip{year:{YEAR}}]- \
    (a2:Area{name:"Aquitaine"}) \
    RETURN sum(case when ((a0) -[a1]-> (a2) ) then a1.nb else 0 end) as NB1, \
    sum(case when ((a0) <-[a1]- (a2) ) then a1.nb else 0 end) as NB2', params)
    .then(result => {
      result.records.forEach(record => {
        nbTot['NB1'] = record.get("NB1").low;
        nbTot['NB2'] = record.get("NB2").low;
      })
      nbTot['Year'] = params.YEAR;
      session.close();
      return nbTot;
    })
    .catch(err => {
      console.log("Erreur : " + err);
      return null;
    })
}