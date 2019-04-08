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

exports.getMonthsValues = (session, params, q, going, aim, array = null) => {
  cmvalues = array || {};
  return session
    .run(q.replace(/{AGES}/g, params.AGES), params)
    .then(result => {
      result.records.forEach(record => {
        recordVar = record.get(aim);
        month = record.get("month");
        !(recordVar in cmvalues) && (cmvalues[recordVar] = {});
        !(going in cmvalues[recordVar]) && (cmvalues[recordVar][going] = { "months": [] })
        cmvalues[recordVar][going].months[month - 1] = record.get("NB");
      });

      return cmvalues;
    });
}

exports.getTotByYear = (session, params, q, nbArgs) => {
  nbTot = {}
  return session
    .run(q, params)
    .then(result => {
      result.records.forEach(record => {
        nbArgs.forEach(i => {
          nbTot['NB'+i] = record.get("NB"+i).low;
        })
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