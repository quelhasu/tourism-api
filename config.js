'use strict';

var nconf = require('nconf');
require('dotenv').config()


nconf.env(['PORT', 'NODE_ENV'])
  .argv({
    'e': {
      alias: 'NODE_ENV',
      describe: 'Set production or development mode.',
      demand: false,
      default: 'development'
    },
    'p': {
      alias: 'PORT',
      describe: 'Port to run on.',
      demand: false,
      default: 3000
    },
    'n': {
      alias: "neo4j",
      describe: "Use local or remote neo4j instance",
      demand: false,
      default: "local"
    }
  })
  .defaults({
    'USERNAME': process.env.DATABASE_USERNAME,
    'PASSWORD' : process.env.DATABASE_PASSWORD,
    'neo4j': 'local',
    'neo4j-local': 'bolt://localhost',
    'neo4j-docker': 'bolt://neo4j',
    'base_url': 'http://localhost:3000',
    'api_path': '/api/v0'
  });

module.exports = nconf;