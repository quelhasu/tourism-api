exports.getDatabaseStats = (session) => {
  vYears = {};
  return session
    .run('MATCH (u:User)-[v:review]->() WHERE v.year >= 2010 RETURN v.year AS YEAR, count(*) as NB, count(distinct u.id) AS NBU')
    .then(function (result) {
      result.records.forEach(record => {
        y = record.get("YEAR").low;
        vYears[y] = {
          "year": y,
          "users": formatNumber(record.get("NBU")),
          "?": 0,
          "reviews": formatNumber(record.get("NB"))
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

exports.getDatabaseCountryStats = (session, params, vYears) => {
  var vYears = vYears || {};
  return session
    .run('MATCH (u:User)-[v:review]->() WHERE u.country = {COUNTRY} AND v.year >= 2010 RETURN v.year AS YEAR, count(distinct u.id) AS NB', params)
    .then(result =>{
      result.records.forEach(record=>{
        y = record.get("YEAR").low;
        !(y in vYears) && (vYears[y]={})
        vYears[y][params.COUNTRY] = formatNumber(record.get("NB"));
      })
      session.close();
      return vYears;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    })
}

exports.getDatabaseDepStats = (session, params, vYears) => {
  var vYears = vYears || {};
  return session
    .run('MATCH ()-[v:review]->(l:Location{dep:{DEP}}) WHERE v.year >= 2010 RETURN v.year AS YEAR, count(*) AS NB', params)
    .then(result =>{
      result.records.forEach(record=>{
        y = record.get("YEAR").low;
        !(y in vYears) && (vYears[y]={})
        vYears[y][params.DEP] = formatNumber(record.get("NB"));
      })
      session.close();
      return vYears;
    })
    .catch(error => {
      console.log("Erreur : " + error);
      return null;
    })
}


function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
}