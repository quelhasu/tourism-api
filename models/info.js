exports.getTopRegions = (session, params) => new Promise((resolve, reject) => {
  var topRegions = [];
  session
    .run('MATCH (a1:Area{country:"France"})-[v:trip{year:{YEAR}}]-> \
    (a2:Area{name:"Aquitaine", country:"France"}) \
    RETURN a1.name as region, \
    sum(v.nb) as NB order by NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topRegions.push(record.get("region"));
      });
      resolve(topRegions);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

exports.getTopAreas = (session, params) => new Promise((resolve, reject) => {
  var topRegions = [];
  session
    .run(`MATCH (a0:AreaGironde)-[a1:trip{year:{YEAR}}]->(a2:AreaGironde) \
    WHERE a0.${params.NAME} = {REGION} AND a2.${params.NAME} = {REGION}\
    RETURN a0.name_3 as shape, sum(a1.nb) as NB \
    order by NB desc LIMIT {TOP}`, params)
    .then(result => {
      result.records.forEach(record => {
        topRegions.push(record.get('shape'));
      });
      session.close();
      resolve(topRegions);
    })
    .catch(error => {
      session.close();
      console.log("Erreur : " + error);
      reject(error);
    })
})

exports.getTopCountries = (session, params) => new Promise((resolve, reject) => {
  var topCountries = [];
  session 
    .run('MATCH (a1:User)-[v:review{year:{YEAR}}]->\
    (a2:Location{region:"Aquitaine", country:"France"}) \
    RETURN a1.country as country, \
    count(*) as NB order by  NB \
    desc LIMIT {TOP}', params)
    .then(result => {
      result.records.forEach(record => {
        topCountries.push(record.get("country"));
      });
      resolve(topCountries);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

exports.getAgeRanges = (session) => new Promise(async (resolve, reject) => {
  var topAges = [];
  session
    .run('MATCH (a:User) return distinct a.age as age order by age')
    .then(result => {
      result.records.forEach(record => {
        topAges.push(record.get("age"));
      })
      resolve(topAges);
    })
    .catch(error => {
      console.log("Erreur : " + error);
      reject(error);
    })
})

exports.getMonthsValues = (session, params, q, going, aim, array = null) => new Promise(async (resolve, reject) => {
  cmvalues = array || {};
  session
    .run(q.replace(/{AGES}/g, params.AGES), params)
    .then(result => {
      result.records.forEach(record => {
        recordVar = record.get(aim);
        month = record.get("month");
        !(recordVar in cmvalues) && (cmvalues[recordVar] = {});
        !(going in cmvalues[recordVar]) && (cmvalues[recordVar][going] = { "months": [] })
        cmvalues[recordVar][going].months[month - 1] = record.get("NB");
      });
      session.close();
      resolve(cmvalues);
    })
    .catch(err => {
      session.close();
      reject(err);
    });
})

/* 
When session is closed driver sends a reset command to the database. 
This causes it to terminate ongoing transaction
*/
exports.getTotByYear = (session, params, q, nbArgs) => new Promise(async (resolve, reject) => {
  nbTot = {}
  session
    .run(q, params)
    .then(result => {
      result.records.forEach(record => {
        nbArgs.forEach(i => {
          nbTot['NB'+i] = record.get("NB"+i).low;
        })
      })
      nbTot['Year'] = params.YEAR;
      session.close();
      resolve(nbTot);
    })
    .catch(err => {
      session.close();
      console.log("Erreur : " + err);
      reject(err);
    })
})

exports.getPageRank = (session, params, q, arg, array=null) => new Promise(async (resolve, reject) => {
  // console.log(q);
  object = array || {}
  session
    .run(q, params)
    .then(result => {
      result.records.forEach(record => {
        var region = record.get(arg)
        !(region in object) && (object[region] = {});
        !(params.YEAR in object[region]) && (object[region][params.YEAR] = {});
        object[region][params.YEAR]['value'] = record.get("score").roundDecimal(2);
      })
      session.close();
      resolve(object);
    })
    .catch(err => {
      session.close();
      console.log("Erreur : " + err);
      reject(err);
    })
})