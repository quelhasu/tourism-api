"use strict";

// neo4j cypher helper module
var nconf = require('../config');

var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(nconf.get('neo4j-local'), neo4j.auth.basic(nconf.get('USERNAME'), nconf.get('PASSWORD')));


exports.getSession = function (context) {
  if(context.neo4jSession) {
    return context.neo4jSession;
  }
  else {
    context.neo4jSession = driver.session();
    return context.neo4jSession;
  }
};