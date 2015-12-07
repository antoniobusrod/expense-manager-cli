#!/usr/bin/env node

const program = require('commander');
const co = require('co');
const search = require('../search');

program
  .version(require('../package').version)
  .usage('[options] <name>')
  .option('-d, --db <db>', 'sqlite database path')
  .option('--dbs <dbs>', 'sqlite databases directory path')
  .option('-c, --category [category]', 'search by category name')
  .parse(process.argv);
const options = {
  dbPath: program.db,
  dbPaths: program.dbs,
  name: program.args[0],
  byCategory: false,
};
co(search(options)).catch(function(err) {
  console.error(err.stack || err);
  process.exit(err.code || -1);
});

