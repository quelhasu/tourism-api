"use strict";

// neo4j cypher helper module
var nconf = require('../config/config');
var neo4j = require('neo4j-driver').v1;
require('dotenv').config()



exports.getSession = function (context) {
  if(context.neo4jSession) {
    return context.neo4jSession;
  }
  else {
    var driver = neo4j.driver(nconf.get(process.env.DATABASE).bolt, neo4j.auth.basic(nconf.get('USERNAME'), nconf.get('PASSWORD')));
    context.neo4jSession = driver.session();
    return context.neo4jSession;
  }
};